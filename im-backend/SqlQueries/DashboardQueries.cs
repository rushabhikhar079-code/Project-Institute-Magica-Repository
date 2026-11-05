namespace IM_backend.SqlQueries
{
    public class DashboardQueries
    {
        public const string GetBranchesForDashboard = @"
            SELECT BranchId, Branchname FROM branch
            WHERE instituteid = @InstituteId AND branch_status = 1
            ORDER BY branchname";

        public const string GetDashboardCount = @"
            SELECT 
            -- Column 1: Total Revenue
            COALESCE(
                ROUND(
                    (
                        SELECT SUM(Basic_Amt)
                        FROM (
                            SELECT ((pi.Basic_Amt - pi.Disc_Amt) + pi.Tax_Amt) AS Basic_Amt
                            FROM payment_installments PI
                            LEFT JOIN installments_received ir ON pi.Installment_id = ir.Installment_Id
                            LEFT JOIN payment p ON pi.Payment_Id = p.Payment_Id
                            LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                            LEFT JOIN branch b ON r.BranchID = b.Branchid
                            WHERE (branch_status<>0 OR branch_status IS NULL) 
                            AND instituteid=@InstituteId
                            AND (@BranchId = 0 OR b.BranchId = @BranchId) 
                            AND receipt_no IS NOT NULL 
                            AND pay_date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01')) 
                            AND pay_date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                            
                            UNION ALL
                            
                            SELECT ((ofri.basicamount - ofri.discountamount) + ofri.taxamount) AS Basic_Amt
                            FROM otherfeesreceived_installments ofri
                            INNER JOIN payment_installments pin ON ofri.InstallmentId = pin.Installment_Id
                            INNER JOIN installments_received ir ON pin.Installment_id = ir.Installment_Id
                            LEFT JOIN payment p ON pin.Payment_Id = p.Payment_Id
                            LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                            LEFT JOIN branch b ON r.BranchID = b.Branchid
                            WHERE (branch_status<>0 OR branch_status IS NULL) 
                            AND instituteid=@InstituteId 
                            AND (@BranchId = 0 OR b.BranchId = @BranchId) 
                            AND receipt_no IS NOT NULL 
                            AND pay_date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01')) 
                            AND pay_date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                            
                            UNION ALL
                            
                            SELECT ((p.Basic_Amt - p.Disc_Amt) + p.Tax_Amt) AS Basic_Amt
                            FROM payment p
                            LEFT JOIN payments_received pr ON p.Payment_Id = pr.Payment_Id
                            LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                            LEFT JOIN branch b ON r.BranchID = b.Branchid
                            WHERE (branch_status<>0 OR branch_status IS NULL) 
                            AND instituteid=@InstituteId 
                            AND (@BranchId = 0 OR b.BranchId = @BranchId) 
                            AND receipt_no IS NOT NULL 
                            AND pay_date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01')) 
                            AND pay_date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                        ) payment_data
                    ), 2
                ), 0
            ) 
            + 
            COALESCE(
                ROUND(
                    (
                        SELECT SUM(gi.qtyissued_price)
                        FROM Inventory_GoodsIssued gi 
                        INNER JOIN inventoryitems i ON gi.itemcode = i.itemcode
                        WHERE 1=1 
                        AND gi.IssuedToOption = 3  
                        AND gi.Issued_Date BETWEEN STR_TO_DATE(CONCAT(@YearMonth, '/01'), '%Y/%m/%d') AND @dtToday 
                        AND i.instid = @InstituteId
                    ), 2
                ), 0
            ) AS TotalRevenue,
            
            -- Column 2: Active Student Count
            (SELECT COUNT(DISTINCT r.RegNo) 
             FROM Registration r
             JOIN Branch b ON r.BranchId = b.BranchId AND r.Registered='Yes' AND r.ActiveStatus=0
             JOIN institute i ON b.Instituteid = i.Instituteid AND b.Instituteid=@InstituteId AND (@BranchId = 0 OR b.BranchId = @BranchId)
            ) AS ActiveStudentCount,
            
            -- Column 3: Registered Student Count
            (SELECT COUNT(*) 
             FROM Registration r
             INNER JOIN Branch b ON r.BranchId = b.BranchId
             WHERE r.Registered = 'No'             
             AND b.Instituteid = @InstituteId 
             AND (@BranchId = 0 OR r.BranchId = @BranchId)
            ) AS RegisteredStudentCount,
            
            -- Column 4: Total Outstanding Collection
            COALESCE(
                (
                    SELECT ROUND(SUM(Basic_Amt), 2)
                    FROM (
                        SELECT ((pi.Basic_Amt - pi.Disc_Amt) + pi.Tax_Amt) AS Basic_Amt
                        FROM payment_installments PI
                        LEFT JOIN installments_received ir ON pi.Installment_id = ir.Installment_Id
                        LEFT JOIN payment p ON pi.Payment_Id = p.Payment_Id
                        LEFT JOIN registration r ON p.Stud_Id = r.RegNo AND StatusFlag=1
                        LEFT JOIN branch b ON r.BranchID = b.Branchid
                        WHERE pi.basic_amt <> 0 
                        AND instituteid=@InstituteId 
                        AND (@BranchId = 0 OR b.BranchId = @BranchId) 
                        AND installment_date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01')) 
                        AND installment_date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01')) 
                        AND receipt_no IS NULL 
                        AND pi.installment_id<>0
                        
                        UNION ALL
                        
                        SELECT ((p.Basic_Amt - p.Disc_Amt) + p.Tax_Amt) AS Basic_Amt
                        FROM payment p 
                        LEFT JOIN payments_received pr ON p.Payment_Id = pr.Payment_Id
                        LEFT JOIN registration r ON p.Stud_Id = r.RegNo AND StatusFlag=1
                        LEFT JOIN branch b ON r.BranchID = b.Branchid
                        WHERE p.basic_amt <> 0  
                        AND instituteid=@InstituteId 
                        AND (@BranchId = 0 OR b.BranchId = @BranchId) 
                        AND Pay_Date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01')) 
                        AND Pay_Date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01')) 
                        AND receipt_no IS NULL
                    ) pr
                ), 0
            )
            +
            COALESCE(
                (
                    SELECT ROUND(SUM(mfi.basicamount), 2)
                    FROM monthlyfeesinstallment mfi
                    INNER JOIN registration r ON mfi.studentid = r.RegNo AND ispaid = 0
                    INNER JOIN branch b ON r.branchid = b.branchid AND b.Instituteid = @InstituteId
                    WHERE CONCAT(feeyear, '-', LPAD(feemonth, 2, 0)) BETWEEN @YearMonth AND @YearMonth
                ), 0
            ) AS TotalOutstandingCollection;";

        public const string GetCollectionDetails = @"
            SELECT COALESCE(ROUND(SUM(Basic_Amt),2),0) AS NetPayment
            FROM (
                SELECT ((pi.Basic_Amt - pi.Disc_Amt) + pi.Tax_Amt) AS Basic_Amt, p.Branchid AS Branch_ID
                FROM payment_installments pi
                LEFT JOIN installments_received ir ON pi.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pi.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                WHERE receipt_no IS NOT NULL {0}
                UNION ALL
                SELECT ((ofri.basicamount - ofri.discountamount) + ofri.taxamount) AS Basic_Amt, ofri.Branchid AS Branch_ID
                FROM otherfeesreceived_installments ofri
                INNER JOIN payment_installments pin ON ofri.InstallmentId = pin.Installment_Id
                INNER JOIN installments_received ir ON pin.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pin.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                WHERE receipt_no IS NOT NULL {0}
                UNION ALL
                SELECT ((p.Basic_Amt - p.Disc_Amt) + p.Tax_Amt) AS Basic_Amt, p.Branchid AS Branch_ID
                FROM payment p
                LEFT JOIN payments_received pr ON p.Payment_Id = pr.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                WHERE receipt_no IS NOT NULL {0}
            ) t1
            RIGHT JOIN branch b ON t1.Branch_ID = b.BranchId
            WHERE instituteid = @InstituteId
            AND (@BranchId = 0 OR b.BranchId = @BranchId)
            AND (branch_status <> 0 OR branch_status IS NULL)";


        public const string StudentGrowth = @"
            SELECT COUNT(r.RegNo) AS 'studCount',MONTH(r.RegDate) RegisteredByMonth,MONTHNAME(r.RegDate) 'monthName',
            DATE_FORMAT(r.RegDate, '%b %y') AS monthYear 
            FROM registration r
            INNER JOIN branch b ON r.BranchID=b.Branchid
            WHERE r.Registered='Yes' AND r.RegDate >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AND instituteid=@InstituteId
            AND ( @BranchId = 0 OR b.BranchId = @BranchId)
            GROUP BY YEAR(r.RegDate), MONTH(r.RegDate)";

        public const string PaymentReceivedAnalysis_Today = @"
            SELECT 
                t.TimeSlot,
                IFNULL(SUM(x.NetPayment), 0) AS NetPayment
            FROM
            (
                SELECT 'Morning' AS TimeSlot
                UNION ALL SELECT 'Afternoon'
                UNION ALL SELECT 'Evening'
                UNION ALL SELECT 'Night'
            ) t
            LEFT JOIN
            (
                SELECT 
                    CASE 
                        WHEN HOUR(pay_date) >= 6 AND HOUR(pay_date) < 12 THEN 'Morning'
                        WHEN HOUR(pay_date) >= 12 AND HOUR(pay_date) < 17 THEN 'Afternoon'
                        WHEN HOUR(pay_date) >= 17 AND HOUR(pay_date) < 21 THEN 'Evening'
                        ELSE 'Night'
                    END AS TimeSlot,
                    ((pi.Basic_Amt - pi.Disc_Amt) + pi.Tax_Amt) AS NetPayment
                FROM payment_installments pi
                LEFT JOIN installments_received ir ON pi.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pi.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId 
                AND ( @BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL AND DATE_FORMAT(pay_date, '%Y/%m/%d') = @Date
                UNION ALL
                SELECT 
                    CASE 
                        WHEN HOUR(pay_date) >= 6 AND HOUR(pay_date) < 12 THEN 'Morning'
                        WHEN HOUR(pay_date) >= 12 AND HOUR(pay_date) < 17 THEN 'Afternoon'
                        WHEN HOUR(pay_date) >= 17 AND HOUR(pay_date) < 21 THEN 'Evening'
                        ELSE 'Night'
                    END AS TimeSlot,
                    ((ofri.basicamount - ofri.discountamount) + ofri.taxamount) AS NetPayment
                FROM otherfeesreceived_installments ofri
                INNER JOIN payment_installments pin ON ofri.InstallmentId = pin.Installment_Id
                INNER JOIN installments_received ir ON pin.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pin.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId 
                AND ( @BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL AND DATE_FORMAT(pay_date, '%Y/%m/%d') = @Date
                UNION ALL
                SELECT 
                    CASE 
                        WHEN HOUR(pay_date) >= 6 AND HOUR(pay_date) < 12 THEN 'Morning'
                        WHEN HOUR(pay_date) >= 12 AND HOUR(pay_date) < 17 THEN 'Afternoon'
                        WHEN HOUR(pay_date) >= 17 AND HOUR(pay_date) < 21 THEN 'Evening'
                        ELSE 'Night'
                    END AS TimeSlot,
                    ((p.Basic_Amt - p.Disc_Amt) + p.Tax_Amt) AS NetPayment
                FROM payment p
                LEFT JOIN payments_received pr ON p.Payment_Id = pr.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId 
                AND ( @BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL AND DATE_FORMAT(pay_date, '%Y/%m/%d') = @Date
            ) x ON t.TimeSlot = x.TimeSlot
            GROUP BY t.TimeSlot
            ORDER BY FIELD(t.TimeSlot, 'Morning', 'Afternoon', 'Evening', 'Night')";

        public const string OutstandingAnalysis_Today = @"
            SELECT t.TimeSlot, IFNULL(SUM(x.due), 0) AS due
            FROM (
                SELECT 'Morning' AS TimeSlot UNION ALL SELECT 'Afternoon' UNION ALL SELECT 'Evening' UNION ALL SELECT 'Night'
            ) t
            LEFT JOIN (
                SELECT IFNULL(ROUND(SUM(Basic_Amt),2),0) AS due,
                CASE
                WHEN HOUR(pr.Installment_date) BETWEEN 5 AND 11 THEN 'Morning'
                WHEN HOUR(pr.Installment_date) BETWEEN 12 AND 16 THEN 'Afternoon'
                WHEN HOUR(pr.Installment_date) BETWEEN 17 AND 23 THEN 'Evening'
                ELSE 'Night'
                END AS TimeSlot
                FROM (
                    SELECT ir.Pay_Date AS Pay_Date, ((pi.Basic_Amt - pi.Disc_Amt) + pi.Tax_Amt) AS Basic_Amt, b.Branchid AS Branch_ID, pi.Installment_Date
                    FROM payment_installments pi
                    LEFT JOIN installments_received ir ON pi.Installment_id = ir.Installment_Id
                    LEFT JOIN payment p ON pi.Payment_Id = p.Payment_Id
                    LEFT JOIN registration r ON p.Stud_Id = r.RegNo AND StatusFlag=1
                    LEFT JOIN branch b ON r.BranchID = b.Branchid
                    WHERE pi.basic_amt <> 0 AND instituteid=@InstituteId
                    AND (@BranchId = 0 OR b.BranchId = @BranchId)
                    AND installment_date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                    AND installment_date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                    AND receipt_no IS NULL AND pi.installment_id<>0
                    UNION
                    SELECT pr.Pay_Date AS Pay_Date, ((p.Basic_Amt - p.Disc_Amt) + p.Tax_Amt) AS Basic_Amt, b.Branchid AS Branch_ID, '01/01/0001' AS Installment_date
                    FROM payment p
                    LEFT JOIN payments_received pr ON p.Payment_Id = pr.Payment_Id
                    LEFT JOIN registration r ON p.Stud_Id = r.RegNo AND StatusFlag=1
                    LEFT JOIN branch b ON r.BranchID = b.Branchid
                    WHERE p.basic_amt <> 0 AND instituteid=@InstituteId
                    AND (@BranchId = 0 OR b.BranchId = @BranchId)
                    AND Pay_Date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                    AND Pay_Date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                    AND receipt_no IS NULL
                ) pr
                GROUP BY
                CASE
                WHEN HOUR(pr.Installment_date) BETWEEN 5 AND 11 THEN 'Morning'
                WHEN HOUR(pr.Installment_date) BETWEEN 12 AND 16 THEN 'Afternoon'
                WHEN HOUR(pr.Installment_date) BETWEEN 17 AND 23 THEN 'Evening'
                ELSE 'Night'
                END
            ) x ON t.TimeSlot = x.TimeSlot
            GROUP BY t.TimeSlot
            ORDER BY FIELD(t.TimeSlot, 'Morning', 'Afternoon', 'Evening', 'Night')";

        public const string OutstandingAnalysis_Today_MonthlyFees = @"
            SELECT t.TimeSlot, IFNULL(SUM(x.due), 0) AS due
            FROM (
                SELECT 'Morning' AS TimeSlot UNION ALL SELECT 'Afternoon' UNION ALL SELECT 'Evening' UNION ALL SELECT 'Night'
            ) t
            LEFT JOIN (
                SELECT ROUND(SUM(mfi.basicamount),2) AS due,
                CASE
                WHEN HOUR(STR_TO_DATE(CONCAT(feeyear, '-', LPAD(feemonth,2,'0'), '-01'), '%Y-%m-%d')) BETWEEN 5 AND 11 THEN 'Morning'
                WHEN HOUR(STR_TO_DATE(CONCAT(feeyear, '-', LPAD(feemonth,2,'0'), '-01'), '%Y-%m-%d')) BETWEEN 12 AND 16 THEN 'Afternoon'
                WHEN HOUR(STR_TO_DATE(CONCAT(feeyear, '-', LPAD(feemonth,2,'0'), '-01'), '%Y-%m-%d')) BETWEEN 17 AND 23 THEN 'Evening'
                ELSE 'Night'
                END AS TimeSlot
                FROM monthlyfeesinstallment mfi
                INNER JOIN registration r ON mfi.studentid = r.RegNo AND ispaid = 0
                INNER JOIN branch b ON r.branchid = b.branchid AND b.Instituteid = @InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                WHERE STR_TO_DATE(CONCAT(feeyear, '-', LPAD(feemonth,2,'0'), '-01'), '%Y-%m-%d') >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                AND STR_TO_DATE(CONCAT(feeyear, '-', LPAD(feemonth,2,'0'), '-01'), '%Y-%m-%d') < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                GROUP BY TimeSlot
            ) x ON t.TimeSlot = x.TimeSlot
            GROUP BY t.TimeSlot
            ORDER BY FIELD(t.TimeSlot, 'Morning', 'Afternoon', 'Evening', 'Night')";

        public const string PaymentReceivedAnalysis_Weekly = @"
            SELECT DAYNAME(pay_date) AS TimeSlot, IFNULL(ROUND(SUM(Basic_Amt),2),0) AS NetPayment
            FROM (
                SELECT ((pi.Basic_Amt - pi.Disc_Amt) + pi.Tax_Amt) AS Basic_Amt, r.BranchID AS branch_id, pay_date
                FROM payment_installments pi
                LEFT JOIN installments_received ir ON pi.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pi.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL AND Pay_Date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                AND Pay_Date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                UNION
                SELECT ((ofri.basicamount - ofri.discountamount) + ofri.taxamount) AS Basic_Amt, r.BranchID AS branch_id, pay_date
                FROM otherfeesreceived_installments ofri
                INNER JOIN payment_installments pin ON ofri.InstallmentId = pin.Installment_Id
                INNER JOIN installments_received ir ON pin.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pin.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL AND Pay_Date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                AND Pay_Date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                UNION
                SELECT ((p.Basic_Amt - p.Disc_Amt) + p.Tax_Amt) AS Basic_Amt, r.BranchID AS branch_id, pay_date
                FROM payment p
                LEFT JOIN payments_received pr ON p.Payment_Id = pr.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL AND Pay_Date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                AND Pay_Date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
            ) pr
            LEFT JOIN branch b ON pr.branch_id = b.branchId
            LEFT JOIN regionalsettings rs ON b.Branchid = rs.BranchId
            GROUP BY DAYNAME(pay_date)
            ORDER BY FIELD(DAYNAME(pay_date), 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')";

        public const string PaymentReceivedAnalysis_Weekly_Inventory = @"
            SELECT COALESCE(ROUND(SUM(gi.qtyissued_price),2),0) AS NetPayment
            FROM Inventory_GoodsIssued gi
            INNER JOIN inventoryitems i ON gi.itemcode = i.itemcode
            WHERE 1=1 AND gi.IssuedToOption = 3 AND gi.Issued_Date = @Date AND i.instid = @InstituteId";

        public const string OutstandingAnalysis_Weekly = @"
            SELECT IFNULL(ROUND(SUM(Basic_Amt),2),0) AS due, DAYNAME(pr.Installment_date) AS TimeSlot
            FROM (
                SELECT ir.Pay_Date AS Pay_Date, ((pi.Basic_Amt - pi.Disc_Amt) + pi.Tax_Amt) AS Basic_Amt, b.Branchid AS Branch_ID, pi.Installment_Date
                FROM payment_installments pi
                LEFT JOIN installments_received ir ON pi.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pi.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo AND StatusFlag=1
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE pi.basic_amt <> 0 AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND installment_date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                AND installment_date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                AND receipt_no IS NULL AND pi.installment_id<>0
                UNION
                SELECT pr.Pay_Date AS Pay_Date, ((p.Basic_Amt - p.Disc_Amt) + p.Tax_Amt) AS Basic_Amt, b.Branchid AS Branch_ID, '01/01/0001' AS Installment_date
                FROM payment p
                LEFT JOIN payments_received pr ON p.Payment_Id = pr.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo AND StatusFlag=1
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE p.basic_amt <> 0 AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND Pay_Date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                AND Pay_Date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                AND receipt_no IS NULL
            ) pr
            GROUP BY DAYOFWEEK(pr.Installment_date), DAYNAME(pr.Installment_date)
            ORDER BY DAYOFWEEK(pr.Installment_date)";

        public const string OutstandingAnalysis_Weekly_MonthlyFees = @"
            SELECT ROUND(SUM(mfi.basicamount),2) AS due,
            DAYNAME(STR_TO_DATE(CONCAT(feeyear, '-', LPAD(feemonth,2,'0'), '-01'), '%Y-%m-%d')) AS TimeSlot
            FROM monthlyfeesinstallment mfi
            INNER JOIN registration r ON mfi.studentid = r.RegNo AND ispaid = 0
            INNER JOIN branch b ON r.branchid = b.branchid AND b.Instituteid = @InstituteId
            AND (@BranchId = 0 OR b.BranchId = @BranchId)
            WHERE STR_TO_DATE(CONCAT(feeyear, '-', LPAD(feemonth,2,'0'), '-01'), '%Y-%m-%d') >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
            AND STR_TO_DATE(CONCAT(feeyear, '-', LPAD(feemonth,2,'0'), '-01'), '%Y-%m-%d') < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
            GROUP BY DAYOFWEEK(STR_TO_DATE(CONCAT(feeyear, '-', LPAD(feemonth,2,'0'), '-01'), '%Y-%m-%d'))";


        public const string PaymentReceivedAnalysis_Monthly = @"
            SELECT DATE_FORMAT(pay_date, '%b %y') AS TimeSlot, IFNULL(ROUND(SUM(Basic_Amt),2),0) AS NetPayment
            FROM (
                SELECT ((pi.Basic_Amt - pi.Disc_Amt) + pi.Tax_Amt) AS Basic_Amt, r.BranchID AS branch_id, pay_date
                FROM payment_installments pi
                LEFT JOIN installments_received ir ON pi.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pi.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL AND Pay_Date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                AND Pay_Date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                UNION
                SELECT ((ofri.basicamount - ofri.discountamount) + ofri.taxamount) AS Basic_Amt, r.BranchID AS branch_id, pay_date
                FROM otherfeesreceived_installments ofri
                INNER JOIN payment_installments pin ON ofri.InstallmentId = pin.Installment_Id
                INNER JOIN installments_received ir ON pin.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pin.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL AND Pay_Date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                AND Pay_Date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                UNION
                SELECT ((p.Basic_Amt - p.Disc_Amt) + p.Tax_Amt) AS Basic_Amt, r.BranchID AS branch_id, pay_date
                FROM payment p
                LEFT JOIN payments_received pr ON p.Payment_Id = pr.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL AND Pay_Date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                AND Pay_Date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
            ) pr
            LEFT JOIN branch b ON pr.branch_id = b.branchId
            LEFT JOIN regionalsettings rs ON b.Branchid = rs.BranchId
            GROUP BY YEAR(pay_date), MONTH(pay_date)
            ORDER BY YEAR(pay_date), MONTH(pay_date)";

        public const string PaymentReceivedAnalysis_Monthly_Inventory = @"
            SELECT COALESCE(ROUND(SUM(gi.qtyissued_price),2),0) AS NetPayment
            FROM Inventory_GoodsIssued gi
            INNER JOIN inventoryitems i ON gi.itemcode = i.itemcode
            WHERE 1=1 AND gi.IssuedToOption = 3 AND gi.Issued_Date = @Date AND i.instid = @InstituteId";

        public const string OutstandingAnalysis_Monthly = @"
            SELECT IFNULL(ROUND(SUM(Basic_Amt),2),0) AS due, DATE_FORMAT(pr.Installment_date, '%b %y') AS TimeSlot
            FROM (
                SELECT ir.Pay_Date AS Pay_Date, ((pi.Basic_Amt - pi.Disc_Amt) + pi.Tax_Amt) AS Basic_Amt, b.Branchid AS Branch_ID, pi.Installment_Date
                FROM payment_installments pi
                LEFT JOIN installments_received ir ON pi.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pi.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo AND StatusFlag=1
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE pi.basic_amt <> 0 AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND installment_date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                AND installment_date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                AND receipt_no IS NULL AND pi.installment_id<>0
                UNION
                SELECT pr.Pay_Date AS Pay_Date, ((p.Basic_Amt - p.Disc_Amt) + p.Tax_Amt) AS Basic_Amt, b.Branchid AS Branch_ID, '01/01/0001' AS Installment_date
                FROM payment p
                LEFT JOIN payments_received pr ON p.Payment_Id = pr.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo AND StatusFlag=1
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE p.basic_amt <> 0 AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND Pay_Date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                AND Pay_Date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                AND receipt_no IS NULL
            ) pr
            GROUP BY YEAR(pr.Installment_date), MONTH(pr.Installment_date)
            ORDER BY YEAR(pr.Installment_date), MONTH(pr.Installment_date)";

        public const string OutstandingAnalysis_Monthly_MonthlyFees = @"
            SELECT ROUND(SUM(mfi.basicamount),2) AS due,
            DATE_FORMAT(STR_TO_DATE(CONCAT(feeyear, '-', LPAD(feemonth,2,'0'), '-01'), '%Y-%m-%d'),'%b %y') AS TimeSlot
            FROM monthlyfeesinstallment mfi
            INNER JOIN registration r ON mfi.studentid = r.RegNo AND ispaid = 0
            INNER JOIN branch b ON r.branchid = b.branchid AND b.Instituteid = @InstituteId
            AND (@BranchId = 0 OR b.BranchId = @BranchId)
            WHERE STR_TO_DATE(CONCAT(feeyear, '-', LPAD(feemonth,2,'0'), '-01'), '%Y-%m-%d') >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
            AND STR_TO_DATE(CONCAT(feeyear, '-', LPAD(feemonth,2,'0'), '-01'), '%Y-%m-%d') < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
            GROUP BY feeyear, feemonth
            ORDER BY feeyear, feemonth";

        public const string Revenue_Yearly = @"
            SELECT YEAR(pay_date) AS TimeSlot, IFNULL(ROUND(SUM(Basic_Amt),2),0) AS NetPayment, IFNULL(pr.branch_id,0) AS branch_id
            FROM (
                SELECT ((pi.Basic_Amt - pi.Disc_Amt) + pi.Tax_Amt) AS Basic_Amt, r.BranchID AS branch_id, pay_date
                FROM payment_installments pi
                LEFT JOIN installments_received ir ON pi.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pi.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL AND Pay_Date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                AND Pay_Date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                UNION
                SELECT ((ofri.basicamount - ofri.discountamount) + ofri.taxamount) AS Basic_Amt, r.BranchID AS branch_id, pay_date
                FROM otherfeesreceived_installments ofri
                INNER JOIN payment_installments pin ON ofri.InstallmentId = pin.Installment_Id
                INNER JOIN installments_received ir ON pin.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pin.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL AND Pay_Date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                AND Pay_Date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
                UNION
                SELECT ((p.Basic_Amt - p.Disc_Amt) + p.Tax_Amt) AS Basic_Amt, r.BranchID AS branch_id, pay_date
                FROM payment p
                LEFT JOIN payments_received pr ON p.Payment_Id = pr.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL AND Pay_Date >= IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()), '-04-01'), CONCAT(YEAR(CURDATE()) - 1, '-04-01'))
                AND Pay_Date < IF(MONTH(CURDATE()) >= 4, CONCAT(YEAR(CURDATE()) + 1, '-04-01'), CONCAT(YEAR(CURDATE()), '-04-01'))
            ) pr
            LEFT JOIN branch b ON pr.branch_id = b.branchId
            LEFT JOIN regionalsettings rs ON b.Branchid = rs.BranchId
            GROUP BY YEAR(pay_date)
            ORDER BY YEAR(pay_date)";

        public const string Revenue_Monthly = @"
            SELECT DATE_FORMAT(pay_date, '%b %y') AS TimeSlot, IFNULL(ROUND(SUM(Basic_Amt),2),0) AS NetPayment, IFNULL(pr.branch_id,0) AS branch_id
            FROM (
                SELECT ((pi.Basic_Amt - pi.Disc_Amt) + pi.Tax_Amt) AS Basic_Amt, r.BranchID AS branch_id, pay_date
                FROM payment_installments pi
                LEFT JOIN installments_received ir ON pi.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pi.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL
                AND Pay_Date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                AND Pay_Date < DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01')
                UNION
                SELECT ((ofri.basicamount - ofri.discountamount) + ofri.taxamount) AS Basic_Amt, r.BranchID AS branch_id, pay_date
                FROM otherfeesreceived_installments ofri
                INNER JOIN payment_installments pin ON ofri.InstallmentId = pin.Installment_Id
                INNER JOIN installments_received ir ON pin.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pin.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL
                AND Pay_Date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                AND Pay_Date < DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01')
                UNION
                SELECT ((p.Basic_Amt - p.Disc_Amt) + p.Tax_Amt) AS Basic_Amt, r.BranchID AS branch_id, pay_date
                FROM payment p
                LEFT JOIN payments_received pr ON p.Payment_Id = pr.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId
                AND (@BranchId = 0 OR b.BranchId = @BranchId)
                AND receipt_no IS NOT NULL
                AND Pay_Date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                AND Pay_Date < DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01')
            ) pr
            LEFT JOIN branch b ON pr.branch_id = b.branchId
            LEFT JOIN regionalsettings rs ON b.Branchid = rs.BranchId
            GROUP BY YEAR(pay_date), MONTH(pay_date)
            ORDER BY YEAR(pay_date), MONTH(pay_date)";

        public const string Revenue_Inventory = @"
            SELECT COALESCE(ROUND(SUM(gi.qtyissued_price),2),0) AS NetPayment
            FROM Inventory_GoodsIssued gi
            INNER JOIN inventoryitems i ON gi.itemcode = i.itemcode
            WHERE 1=1 AND gi.IssuedToOption = 3 AND gi.Issued_Date = @Date AND i.instid = @InstituteId";

        public const string GetRegistrationStatus = @"
            SELECT paytype,total,enq,reg,noofstudents,noofreg,noofenq,COUNT(regno) AS totalcount,
            IF((SELECT COUNT(regno) FROM institute i JOIN branch b ON i.instituteid=b.instituteid 
            LEFT JOIN registration r ON b.branchid=r.branchid  WHERE r.registered='yes' 
            AND i.instituteid=@InstituteId AND ( @BranchId = 0 OR b.BranchId = @BranchId) 
            GROUP BY b.instituteid) IS NULL,0,(SELECT COUNT(regno) FROM institute i JOIN branch b ON i.instituteid=b.instituteid 
            LEFT JOIN registration r ON b.branchid=r.branchid  WHERE r.registered='yes' 
            AND i.instituteid=@InstituteId
            GROUP BY b.instituteid)) AS regcount,
            IF((SELECT COUNT(regno) FROM institute i JOIN branch b ON i.instituteid=b.instituteid 
            LEFT JOIN registration r ON b.branchid=r.branchid  WHERE r.registered='no' 
            AND i.instituteid=@InstituteId AND ( @BranchId = 0 OR b.BranchId = @BranchId) 
            GROUP BY b.instituteid) IS NULL,0,(SELECT COUNT(regno) FROM institute i 
            JOIN branch b ON i.instituteid=b.instituteid 
            LEFT JOIN registration r ON b.branchid=r.branchid  WHERE r.registered='no' 
            AND i.instituteid=@InstituteId AND (@BranchId = 0 OR b.BranchId = @BranchId) 
            GROUP BY b.instituteid)) AS enqcount,i.regtype,IsBranchwise
            FROM institute i
            JOIN branch b ON i.instituteid=b.instituteid
            LEFT JOIN registration r ON b.branchid=r.branchid
            WHERE i.instituteid=@InstituteId AND ( @BranchId = 0 OR b.BranchId = @BranchId) 
            GROUP BY b.instituteid";

        public const string StaffLeaveDistribution = @"
            SELECT 
            d.dt AS RequestDate,
            IFNULL(SUM(CASE WHEN lt.approved = 1 THEN 1 END), 0) AS ApprovedCount,
            IFNULL(SUM(CASE WHEN lt.approved = 0 AND lt.isverified = 1 THEN 1 END), 0) AS RejectedCount,
            IFNULL(SUM(CASE WHEN lt.isverified = 0 THEN 1 END), 0) AS PendingCount
            FROM (
                SELECT 
                    DATE_ADD(
                        DATE_FORMAT(CURDATE(), '%Y-%m-01'),
                        INTERVAL n DAY
                    ) AS dt
                FROM (
                    SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
                    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
                    UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14
                    UNION ALL SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19
                    UNION ALL SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24
                    UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29
                    UNION ALL SELECT 30
                ) numbers
                WHERE DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL n DAY) 
                      <= LAST_DAY(CURDATE())
            ) d            
            LEFT JOIN leave_taken lt 
                ON DATE(lt.dateofreq) = d.dt
                AND lt.instid = @InstituteId
            AND(@BranchId = 0 OR lt.BranchId = @BranchId) GROUP BY d.dt ORDER BY d.dt";

        public const string StaffBirthday = @"
            SELECT t.trainnerid,CONCAT_WS(' ',t.t_firstname,t.t_middlename,t.t_lastname) AS StaffName,DATE_FORMAT(t.DOB,'%Y/%m/%d') AS DOB,t.t_contact,t.t_email
            FROM trainner t
            JOIN institute i ON t.instid = i.Instituteid
            WHERE 1=1 AND MONTH(DOB)=MONTH(@Date) AND DAY(DOB)=DAY(@Date)  AND t.instid=@InstituteId
            AND (@BranchId = 0 OR t.reftrainerid=0 AND t.Branchid IN(SELECT Branchid FROM userbranches WHERE userid = @UserId))
            ORDER BY CONCAT(t.t_firstname,' ',t.t_middlename,' ',t.t_lastname)";

        public const string TodayCollection_Count = @"
            SELECT COALESCE(ROUND(SUM(Basic_Amt),2),0) AS NetPayment
            FROM (
                SELECT CAST(p.Stud_Id AS CHAR CHARSET utf8) AS Stud_ID
                ,IF((r.RegNo_ManUAL <> ''),r.RegNo_ManUAL,p.Stud_Id) AS MStud_ID,ir.Pay_Date AS Pay_Date,ir.Receipt_No AS Receipt_No,
                IF((ir.Manual_ReceiptNo <> ''),ir.Manual_ReceiptNo,ir.Receipt_No) AS MReceipt_No,
                r.Fname AS FName,r.Mname AS MName,r.Lname AS LName,CAST(pi.Installment_No AS CHAR CHARSET utf8) AS Installment_No,ir.Cheque_No AS Cheque_No,
                ir.Cheque_Date AS Cheque_Date,ir.Bank AS Bank_Name,b.Instituteid AS Institute_ID,((pi.Basic_Amt - pi.Disc_Amt) + pi.Tax_Amt) AS Basic_Amt,
                0 AS Sub_Disc,p.Payment_Id AS Payment_ID,b.Branchid AS Branch_ID,pi.Installment_id AS Installment_ID,r.PContact AS PContact,pi.Installment_Date AS Installment_date,
                r.StatusFlag AS StatusFlag,CONCAT(r.Fname,' ',r.Mname,' ',r.Lname) AS name,pi.Basic_Amt AS Bs_Amt,pi.Tax_Amt AS Tax_Amt,pi.Tax_Per AS taxrate,pi.Disc_Amt AS Disc_Amt
                FROM payment_installments pi
                LEFT JOIN installments_received ir ON pi.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pi.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId AND receipt_no IS NOT NULL AND DATE_FORMAT(pay_date,'%Y/%m/%d') = @Date
                UNION ALL
                SELECT CAST(p.Stud_Id AS CHAR CHARSET utf8) AS Stud_ID
                ,IF((r.RegNo_ManUAL <> ''),r.RegNo_ManUAL,p.Stud_Id) AS MStud_ID,ir.Pay_Date AS Pay_Date,ir.Receipt_No AS Receipt_No,
                IF((ir.Manual_ReceiptNo <> ''),ir.Manual_ReceiptNo,ir.Receipt_No) AS MReceipt_No,
                r.Fname AS FName,r.Mname AS MName,r.Lname AS LName,CAST(pin.Installment_No AS CHAR CHARSET utf8) AS Installment_No,
                ir.Cheque_No AS Cheque_No,ir.Cheque_Date AS Cheque_Date,ir.Bank AS Bank_Name,b.Instituteid AS Institute_ID,
                ((ofri.basicamount - ofri.discountamount) + ofri.taxamount) AS Basic_Amt,0 AS Sub_Disc,p.Payment_Id AS Payment_ID,b.Branchid AS Branch_ID,
                pin.Installment_id AS Installment_ID,r.PContact AS PContact,pin.Installment_Date AS Installment_date,r.StatusFlag AS StatusFlag,
                CONCAT(r.Fname,' ',r.Mname,' ',r.Lname) AS name,pin.Basic_Amt AS Bs_Amt,pin.Tax_Amt AS Tax_Amt,pin.Tax_Per AS taxrate,
                ofri.discountamount AS Disc_Amt
                FROM otherfeesreceived_installments ofri
                INNER JOIN payment_installments pin ON ofri.InstallmentId = pin.Installment_Id
                INNER JOIN installments_received ir ON pin.Installment_id = ir.Installment_Id
                LEFT JOIN payment p ON pin.Payment_Id = p.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId AND receipt_no IS NOT NULL AND DATE_FORMAT(pay_date,'%Y/%m/%d') = @Date
                UNION ALL
                SELECT p.Stud_Id AS Stud_ID,IF((r.RegNo_ManUAL <> ''),r.RegNo_ManUAL,p.Stud_Id) AS MStud_ID,pr.Pay_Date AS Pay_Date,CAST(pr.Receipt_No AS CHAR CHARSET utf8) AS Receipt_No,
                IF((pr.Manual_ReceiptNo <> ''),pr.Manual_ReceiptNo,pr.Receipt_No) AS MReceipt_No,r.Fname AS FName,r.Mname AS MName,r.Lname AS LName,0 AS Installment_No,pr.Cheque_No AS Cheque_No,
                pr.Cheque_Date AS Cheque_Date,pr.Bank AS Bank_Name,b.Instituteid AS Institute_ID,((p.Basic_Amt - p.Disc_Amt) + p.Tax_Amt) AS Basic_Amt,0 AS Sub_Disc,p.Payment_Id AS Payment_ID,
                b.Branchid AS Branch_ID,0 AS Installment_ID,r.PContact AS PContact,'01/01/0001' AS Installment_date,r.StatusFlag AS StatusFlag,CONCAT(r.Fname,' ',r.Mname,' ',r.Lname) AS name,
                p.Basic_Amt AS Bs_Amt,p.Tax_Amt AS Tax_Amt,p.Tax_Per AS taxrate,p.Disc_Amt AS Disc_Amt
                FROM payment p
                LEFT JOIN payments_received pr ON p.Payment_Id = pr.Payment_Id
                LEFT JOIN registration r ON p.Stud_Id = r.RegNo
                LEFT JOIN branch b ON r.BranchID = b.Branchid
                WHERE (branch_status<>0 OR branch_status IS NULL) AND instituteid=@InstituteId AND receipt_no IS NOT NULL AND DATE_FORMAT(pay_date,'%Y/%m/%d') = @Date
            ) pr";

        public const string TodayCollection_Count_Inventory = @"
            SELECT COALESCE(ROUND(SUM(gi.qtyissued_price),2),0) AS NetPayment
            FROM Inventory_GoodsIssued gi
            INNER JOIN inventoryitems i ON gi.itemcode = i.itemcode
            WHERE 1=1 AND gi.IssuedToOption=3 AND gi.Issued_Date = @Date AND i.instid = @InstituteId";

        public const string LiveClasses = @"
         SELECT 
         COUNT(MeetingId) AS liveClassesCount,
         COALESCE(
             GROUP_CONCAT(TopicName SEPARATOR ' • '), 
             'No active live classes today'
        ) AS liveClassTopics
        FROM virtualclassmeetingdetails
        WHERE InstituteId = @InstituteId
        AND (0 = 0 OR BranchId = @BranchId)
        AND IsActive = 1
        AND startdatetime >= CURDATE() 
        AND startdatetime < CURDATE() + INTERVAL 1 DAY;";
    }
}
