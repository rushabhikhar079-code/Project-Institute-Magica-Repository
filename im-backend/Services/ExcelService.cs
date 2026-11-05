using IM_backend.Dtos;
using IM_backend.Interfaces;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using OfficeOpenXml;
using System.Data;
using System.Text.RegularExpressions;

namespace IM_backend.Services
{
    public class ExcelService : IExcelService
    {
        public async Task<(List<TopicExcelRowDto> ValidRows, string ErrorLog)> ParseTopicExcelAsync(Stream fileStream, string fileName)
        {
            var rows = new List<TopicExcelRowDto>();
            var errorLog = new System.Text.StringBuilder();
            var topicSeq = new System.Collections.Hashtable();
            var topicName = new System.Collections.Hashtable();

            string ext = Path.GetExtension(fileName).ToLower();
            DataTable dataTable;

            if (ext == ".xlsx")
            {
                // Use EPPlus for .xlsx files
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                using (var package = new ExcelPackage(fileStream))
                {
                    var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                    if (worksheet == null)
                        throw new Exception("No worksheet found in Excel file");

                    int rowCount = worksheet.Dimension.Rows;
                    int colCount = worksheet.Dimension.Columns;

                    // Validate columns
                    if (colCount != 5)
                        throw new Exception("Invalid import file-please check the columns and select correct import file.");

                    string[] expectedColumns = { "Topic Sequence Number", "Topic Name", "Duration", "Duration Unit", "Remark" };
                    for (int i = 0; i < expectedColumns.Length; i++)
                    {
                        string colName = worksheet.Cells[1, i + 1].Text;
                        if (colName != expectedColumns[i])
                            throw new Exception($"{expectedColumns[i]} Column not Match Or not Present.");
                    }

                    // Convert to DataTable for consistent processing
                    dataTable = new DataTable();
                    for (int i = 1; i <= colCount; i++)
                    {
                        dataTable.Columns.Add(worksheet.Cells[1, i].Text);
                    }

                    for (int row = 2; row <= rowCount; row++)
                    {
                        DataRow dataRow = dataTable.NewRow();
                        for (int col = 1; col <= colCount; col++)
                        {
                            dataRow[col - 1] = worksheet.Cells[row, col].Text;
                        }
                        dataTable.Rows.Add(dataRow);
                    }
                }
            }
            else if (ext == ".xls")
            {
                // Use NPOI for .xls files (Excel 97-2003 format)
                IWorkbook workbook;
                using (fileStream)
                {
                    workbook = new HSSFWorkbook(fileStream);
                }

                var worksheet = workbook.GetSheetAt(0);
                int rowCount = worksheet.LastRowNum;
                int colCount = worksheet.GetRow(0).LastCellNum;

                // Validate columns
                if (colCount != 5)
                    throw new Exception("Invalid import file-please check the columns and select correct import file.");

                string[] expectedColumns = { "Topic Sequence Number", "Topic Name", "Duration", "Duration Unit", "Remark" };
                var headerRow = worksheet.GetRow(0);
                for (int i = 0; i < expectedColumns.Length; i++)
                {
                    string colName = headerRow.GetCell(i)?.StringCellValue ?? string.Empty;
                    if (colName != expectedColumns[i])
                        throw new Exception($"{expectedColumns[i]} Column not Match Or not Present.");
                }

                // Convert to DataTable for consistent processing
                dataTable = new DataTable();
                for (int i = 0; i < colCount; i++)
                {
                    dataTable.Columns.Add(headerRow.GetCell(i)?.StringCellValue ?? string.Empty);
                }

                for (int row = 1; row <= rowCount; row++)
                {
                    var dataRow = worksheet.GetRow(row);
                    if (dataRow == null) continue;

                    DataRow newRow = dataTable.NewRow();
                    for (int col = 0; col < colCount; col++)
                    {
                        var cell = dataRow.GetCell(col);
                        newRow[col] = cell?.ToString() ?? string.Empty;
                    }
                    dataTable.Rows.Add(newRow);
                }

                workbook.Close();
            }
            else
            {
                throw new Exception("Invalid file format. Only .xls and .xlsx files are supported.");
            }

            // Parse and validate rows from DataTable
            for (int row = 0; row < dataTable.Rows.Count; row++)
            {
                int rowIndex = row + 2; // Excel row number (header is row 1)
                bool isValid = true;

                var topicSeqNum = dataTable.Rows[row][0]?.ToString() ?? string.Empty;
                var topicNameVal = dataTable.Rows[row][1]?.ToString() ?? string.Empty;
                var duration = dataTable.Rows[row][2]?.ToString() ?? string.Empty;
                var durationUnit = dataTable.Rows[row][3]?.ToString() ?? string.Empty;
                var remark = dataTable.Rows[row][4]?.ToString() ?? string.Empty;

                // Skip empty rows (all 5 columns empty)
                if (string.IsNullOrEmpty(topicSeqNum) &&
                    string.IsNullOrEmpty(topicNameVal) &&
                    string.IsNullOrEmpty(duration) &&
                    string.IsNullOrEmpty(durationUnit) &&
                    string.IsNullOrEmpty(remark))
                    continue;

                // Regex patterns
                Regex regex_durationunit = new Regex("[@a-zA-Z]");
                Regex regex_topicname = new Regex(@"[a-zA-Z0-9]");

                // Validate Topic Sequence Number
                if (string.IsNullOrEmpty(topicSeqNum))
                {
                    errorLog.AppendLine($"Row no. {rowIndex}  Topic sequence no. is missing or invalid data");
                    isValid = false;
                }
                else
                {
                    if (topicSeq.ContainsKey(topicSeqNum))
                    {
                        errorLog.AppendLine($"Row no. {rowIndex}  Topic Sequence Number already exists");
                        isValid = false;
                    }
                    else
                    {
                        topicSeq.Add(topicSeqNum, 0);
                    }

                    if (Regex.IsMatch(topicSeqNum, @".*\..*\..*"))
                    {
                        errorLog.AppendLine($"Row no. {rowIndex}  Topic sequence no. is missing or invalid data");
                        isValid = false;
                    }

                    if (isValid)
                    {
                        string[] seqnum = topicSeqNum.Split('.');
                        if (seqnum[0].ToString() == "0")
                        {
                            errorLog.AppendLine($"Row no. {rowIndex}  Topic sequence no. is missing or invalid data");
                            isValid = false;
                        }
                    }

                    if (isValid)
                    {
                        if (float.TryParse(topicSeqNum, out float topicSeqNumFloat))
                        {
                            if (!Regex.IsMatch(topicSeqNumFloat.ToString(), @"^\-?[0-9]+(\.\d+)?$"))
                            {
                                errorLog.AppendLine($"Row no. {rowIndex}  Topic sequence no. is missing or invalid data");
                                isValid = false;
                            }
                        }
                        else
                        {
                            errorLog.AppendLine($"Row no. {rowIndex}  Topic sequence no. is missing or invalid data");
                            isValid = false;
                        }
                    }
                }

                // Validate Topic Name
                if (string.IsNullOrEmpty(topicNameVal))
                {
                    errorLog.AppendLine($"Row no. {rowIndex} Topic Name is missing or invalid data");
                    isValid = false;
                }
                else
                {
                    if (topicName.ContainsKey(topicNameVal))
                    {
                        errorLog.AppendLine($"Row no. {rowIndex}  Topic name already exists");
                        isValid = false;
                    }
                    else
                    {
                        topicName.Add(topicNameVal, 0);
                    }

                    if (topicNameVal.Length > 40 || !regex_topicname.IsMatch(topicNameVal))
                    {
                        errorLog.AppendLine($"Row no. {rowIndex} Topic name already exists");
                        isValid = false;
                    }
                }

                // Validate Duration
                if (string.IsNullOrEmpty(duration))
                {
                    errorLog.AppendLine($"Row no. {rowIndex} Duration is missing or invalid data");
                    isValid = false;
                }
                else if (duration == "0")
                {
                    errorLog.AppendLine($"Row no. {rowIndex} Duration is missing or invalid data");
                    isValid = false;
                }
                else
                {
                    if (!Regex.IsMatch(duration, @"^(\d+)?([.]?\d{0,2})?$"))
                    {
                        errorLog.AppendLine($"Row no. {rowIndex} Duration is missing or invalid data");
                        isValid = false;
                    }
                }

                // Validate Duration Unit
                if (string.IsNullOrEmpty(durationUnit))
                {
                    errorLog.AppendLine($"Row no. {rowIndex} Duration unit missing or invalid data");
                    isValid = false;
                }
                else
                {
                    if (durationUnit.Length > 7 || !regex_durationunit.IsMatch(durationUnit))
                    {
                        errorLog.AppendLine($"Row no. {rowIndex} Duration unit is missing or invalid data");
                        isValid = false;
                    }

                    string trimmedUnit = durationUnit.TrimEnd().ToLower();
                    if (trimmedUnit == "month" || trimmedUnit == "day" || trimmedUnit == "hour")
                    {
                        errorLog.AppendLine($"Row no. {rowIndex} Duration unit is missing or invalid data");
                        isValid = false;
                    }
                }

                if (isValid)
                {
                    rows.Add(new TopicExcelRowDto
                    {
                        RowNumber = rowIndex,
                        TopicSequenceNumber = topicSeqNum,
                        TopicName = topicNameVal,
                        Duration = duration,
                        DurationUnit = durationUnit,
                        Remark = remark
                    });
                }
            }

            return await Task.FromResult((rows, errorLog.ToString()));
        }
    }
}