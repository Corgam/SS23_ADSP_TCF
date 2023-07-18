from netCDF4 import Dataset
import json
import tempfile
import os
import numpy as np
import simplejson

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

    def convert_netcdf_data_to_json(self, netCDF4_file, filter, is_CERv2, step_size):
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

            # Store variables
            for var_name, var in dataset.variables.items():
                if var_name in filter:
                    # store variable data
                    var_data = var[:].filled() # convert masked array to numpy array
                    dime = []


                    ## re-order cerv2 dimensions
                    if is_CERv2 and len(var_data.shape) == 3:
                        # "west_east", "south_north", "time"
                        var_data = var_data.transpose(2, 1, 0)
                        dime = var.dimensions[::-1]
                        var_data = var_data[::step_size, ::step_size, :]


                    ## re-order cerv2 dimensions
                    if is_CERv2 and len(var_data.shape) == 4:
                        # "west_east", "south_north", "time", "pressure",
                        var_data = var_data.transpose(3, 2, 0, 1)
                        dime = [var.dimensions[3], var.dimensions[2], var.dimensions[0], var.dimensions[1]]
                        var_data = var_data[::step_size, ::step_size, :, :]


                    data = {
                        'variables_data': {
                            var_name: {
                                'dimensions': dime,
                                'data': var_data.tolist()
                            }
                        }
                    }

                    # yield json lines
                    yield simplejson.dumps(data, default=custom_encoder, ignore_nan=True) + "||*split*||"
