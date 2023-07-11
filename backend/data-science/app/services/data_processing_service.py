from netCDF4 import Dataset
import json
import tempfile
import os
import numpy as np

def custom_encoder(obj):
    if isinstance(obj, np.ndarray):
        if obj.dtype == np.float32:
            return obj.astype(float).tolist()
        elif obj.dtype == np.int32:
            return obj.astype(int).tolist()
    elif isinstance(obj, np.float32):
        return float(obj)
    elif isinstance(obj, np.int32):
        return int(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

class DataProcessingService:
    def convert_netcdf_to_json(self, netCDF4_file):
        """
        Converts a NetCDF file to JSON format.

        Args:
            netCDF4_file (FileStorage): The uploaded NetCDF file.

        Yields:
            str: JSON data generated from the NetCDF file.
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            file_path = os.path.join(temp_dir, netCDF4_file.filename)
            netCDF4_file.save(file_path)

            dataset = Dataset(file_path)

            data = {}
            for var_name, var in dataset.variables.items():
                # Convert MaskedArray to NumPy array and then to nested list
                var_data = var[:].filled()
                data[var_name] = {
                    'dimensions': var.dimensions,
                    'data': var_data.tolist()
                }

            for attr_name in dataset.ncattrs():
                data[attr_name] = getattr(dataset, attr_name)

            yield json.dumps(data, default=custom_encoder)



