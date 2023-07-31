// Enum representing supported raw file types for creating datafiles
// These types are used in the Attach endpoint, replacing the value of `content.data`, and do not create multiple datafiles.
export enum SupportedRawFileTypes {
  JSON = "JSON",
  CSV = "CSV",
  TXT = "TXT",
  NETCDF = "NETCDF",
}

// Enum representing supported dataset file types
// These types create multiple datafiles.
export enum SupportedDatasetFileTypes {
  NONE = "NONE",
  SIMRA = "SIMRA",
  CERV2 = "CERV2",
  CSV = "CSV",
}
