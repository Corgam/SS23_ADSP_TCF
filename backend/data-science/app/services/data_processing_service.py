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
    def convert_netcdf_metadata_to_json(self, netCDF4_file):
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

            data = {
                'dimensions': {}, #  list of dimensions and their sizes
                'variables_metadata': {}, #  metadata about each variable
                'global_attributes': {} # global metadata
            }

            # Store dimensions
            for dim_name, dim in dataset.dimensions.items():
                data['dimensions'][dim_name] = len(dim)

            # Store variables
            for var_name, var in dataset.variables.items():
                data['variables_metadata'][var_name] = {
                    'dimensions': var.dimensions,
                    'attributes': {}
                }

                for attr_name in var.ncattrs():
                    data['variables_metadata'][var_name]['attributes'][attr_name] = getattr(var, attr_name)

            # Store global attributes
            for attr_name in dataset.ncattrs():
                data['global_attributes'][attr_name] = getattr(dataset, attr_name)


            yield json.dumps(data, default=custom_encoder)

    def convert_netcdf_data_to_json(self, netCDF4_file):
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

            data = {
                'variables_data': {}, #  actual data
            }

            # Store variables
            for var_name, var in dataset.variables.items():
                # store variable data
                var_data = var[:].filled()
                data['variables_data'][var_name] = {
                    'dimensions': var.dimensions,
                    'data': var_data.tolist()
                }

            yield json.dumps(data, default=custom_encoder)



