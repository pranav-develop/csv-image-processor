export default abstract class FileValidator {
  public abstract errors: string[];
  public abstract validate({
    filepath,
    schema,
  }: IFileValidatorOptions<any>): Promise<void>;
}

export interface IFileValidatorOptions<T> {
  schema: T[];
  filepath: string;
}
