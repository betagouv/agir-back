export type Translator = {
  source_version: number;
  target_version: number;
  translate_function: (obj: any) => void;
};
