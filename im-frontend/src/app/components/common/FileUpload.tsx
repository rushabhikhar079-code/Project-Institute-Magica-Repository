import { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import {
  useController,
  useFormContext,
  type FieldValues,
  type Path,
} from "react-hook-form";
import * as XLSX from "xlsx";
interface ExistingFile {
  name: string;
  path: string;
  extension?: string;
  size?: number;
}

interface FileUploadProps<T extends FieldValues> {
  name: Path<T>;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  allowedMimeTypes?: string[];
  existingFile?: ExistingFile | null;
  onRemoveExisting?: () => void;
  onFileSelected?: (file: File) => void;
}

const FileUpload = <T extends FieldValues>({
  name,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 10,
  label = "Choose File",
  helperText,
  disabled = false,
  existingFile = null,
  onRemoveExisting,
  onFileSelected,
}: FileUploadProps<T>) => {
  const { control, setError, clearErrors, setValue } = useFormContext<T>();
  const inputRef = useRef<HTMLInputElement>(null);

  const { field, fieldState } = useController({
    name,
    control,
  });

  const selectedFile = field.value as File | null;
  const [invalidFile, setInvalidFile] = useState(false);
  const [removedExistingFile, setRemovedExistingFile] = useState(false);
  const [fileError, setFileError] = useState<string>("");
  const handleFileChange = async (file?: File) => {
    if (!file) return;

    setRemovedExistingFile(false);
    setFileError("");

    const allowedExtensions = accept
      .split(",")
      .map((type) => type.trim().toLowerCase());

    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const maxSize = maxSizeMB * 1024 * 1024;

    let errorMessage = "";

    if (!allowedExtensions.includes(fileExtension)) {
      const allowedTypes = allowedExtensions
        .map((extension) => extension.replace(".", "").toUpperCase())
        .join(", ");

      errorMessage = `Only ${allowedTypes} files are allowed`;
    } else if (file.size > maxSize) {
      errorMessage = `File size must not exceed ${maxSizeMB} MB`;
    }

    if (errorMessage) {
      setFileError(errorMessage);

      // Don't keep invalid file
      setValue(name, null as any, {
        shouldDirty: true,
        shouldValidate: false,
      });
      onFileSelected?.(file);
      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    // ✅ Valid file
    setFileError("");
    clearErrors(name);

    setValue(name, file as any, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  const handleRemove = () => {
    // Existing server-side file was intentionally removed
    if (existingFile && !selectedFile) {
      setRemovedExistingFile(true);
      onRemoveExisting?.();
    }

    // Remove newly selected file from RHF
    field.onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };
  const handleExistingPreview = () => {
    if (!existingFile?.path) return;

    const fileUrl = existingFile.path.startsWith("http")
      ? existingFile.path
      : `${window.location.origin}${existingFile.path}`;

    window.open(fileUrl, "_blank");
  };
  const handlePreview = async () => {
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();

    // Excel files
    if (extension === "xlsx" || extension === "xls") {
      const arrayBuffer = await selectedFile.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
      });

      const previewWindow = window.open("", "_blank");

      if (!previewWindow) return;

      const sheets = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];

        return `
        <h2>${sheetName}</h2>
        ${XLSX.utils.sheet_to_html(worksheet)}
      `;
      }).join("<hr />");

      previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedFile.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: #f8fafc;
            }

            h2 {
              margin-top: 20px;
            }

            table {
              border-collapse: collapse;
              background: white;
              width: 100%;
            }

            td, th {
              border: 1px solid #d1d5db;
              padding: 8px;
              text-align: left;
            }

            th {
              background: #f1f5f9;
            }

            hr {
              margin: 30px 0;
              border: 0;
              border-top: 1px solid #d1d5db;
            }
          </style>
        </head>

        <body>
          ${sheets}
        </body>
      </html>
    `);

      previewWindow.document.close();
      return;
    }

    // Everything else
    const fileUrl = URL.createObjectURL(selectedFile);

    const previewWindow = window.open("", "_blank");

    if (!previewWindow) return;

    previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${selectedFile.name}</title>
        <style>
          html,
          body {
            margin: 0;
            width: 100%;
            height: 100%;
            background: #f8fafc;
          }

          body {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }

          audio,
          video,
          img {
            max-width: 90%;
            max-height: 90%;
          }
        </style>
      </head>

      <body>
        <iframe
          src="${fileUrl}"
          title="${selectedFile.name}"
        ></iframe>
      </body>
    </html>
  `);

    previewWindow.document.close();
  };
  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          handleFileChange(e.target.files?.[0]);
        }}
      />
      {!selectedFile || fileError ? (
        <>
          {existingFile && !removedExistingFile && !invalidFile ? (
            <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#0F4C81]" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {existingFile.name}
                </p>

                <p className="text-xs text-gray-400">
                  {existingFile.size
                    ? `${(existingFile.size / 1024 / 1024).toFixed(2)} MB`
                    : "Existing attachment"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleExistingPreview}
                className="px-3 py-1.5 text-xs font-medium text-[#0F4C81] border border-[#0F4C81]/20 rounded-lg hover:bg-[#0F4C81]/5 transition-colors"
              >
                Preview
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                if (!disabled) {
                  inputRef.current?.click();
                }
              }}
              className={`
          flex items-center gap-3 px-4 py-3
          border-2 border-dashed border-gray-200
          rounded-xl cursor-pointer
          hover:border-[#0F4C81]/40
          hover:bg-[#0F4C81]/3
          transition-all group
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${fieldState.error ? "border-red-300" : ""}
        `}
            >
              <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0F4C81]/15">
                <Upload className="w-4 h-4 text-[#0F4C81]" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">{label}</p>

                <p className="text-xs text-gray-400">
                  {helperText ||
                    `No file chosen · ${accept
                      .replace(/\./g, "")
                      .replace(/,/g, ", ")
                      .toUpperCase()} · Max ${maxSizeMB}MB`}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
          <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-[#0F4C81]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {selectedFile.name}
            </p>

            <p className="text-xs text-gray-400">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

          <button
            type="button"
            onClick={handlePreview}
            className="px-3 py-1.5 text-xs font-medium text-[#0F4C81] border border-[#0F4C81]/20 rounded-lg hover:bg-[#0F4C81]/5 transition-colors"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={handleRemove}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {(fileError || fieldState.error) && (
        <p className="mt-1 text-xs text-red-500">
          {fileError || fieldState.error?.message}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
