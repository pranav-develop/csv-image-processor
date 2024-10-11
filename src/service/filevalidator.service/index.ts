import CSVFileValidator from "./CSVFileValidator";
import FileValidator from "./FileValidator";

export function getFileValidatorInstance({
  mimeType,
}: {
  mimeType: string;
}): FileValidator {
  switch (mimeType) {
    case CSVFileValidator.mimeType:
      return new CSVFileValidator();
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

