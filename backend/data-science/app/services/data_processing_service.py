import json
import os
import tempfile

import numpy as np
import simplejson
from app.errors import NoCoordinatesError
from netCDF4 import Dataset


def custom_encoder(obj):
    """
    Custom JSON encoder to handle serialization of specific data types.

    Args:
        obj (object): The object to be serialized.

    Returns:
        object: A JSON serializable representation of the input object.
    """
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.float32):
        return float(obj)
    elif isinstance(obj, np.int32):
        return int(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


class DataProcessingService:
    """
    A service for converting NetCDF files to JSON format and performing data processing.

    This class provides methods for converting NetCDF metadata and data to JSON, as well as
    chunking NetCDF data into JSON format with filtering and dimension reduction.
    """
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
                "dimensions": {},  #  list of dimensions and their sizes
                "variables_metadata": {},  #  metadata about each variable
                "global_attributes": {},  # global metadata
            }

            # Store dimensions
            for dim_name, dim in dataset.dimensions.items():
                data["dimensions"][dim_name] = len(dim)

            # Store variables
            for var_name, var in dataset.variables.items():
                data["variables_metadata"][var_name] = {
                    "dimensions": var.dimensions,
                    "attributes": {},
                }

                for attr_name in var.ncattrs():
                    data["variables_metadata"][var_name]["attributes"][
                        attr_name
                    ] = getattr(var, attr_name)

            # Store global attributes
            for attr_name in dataset.ncattrs():
                data["global_attributes"][attr_name] = getattr(dataset, attr_name)

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
                "variables_data": {},  #  actual data
            }

            # Store variables
            for var_name, var in dataset.variables.items():
                # store variable data
                var_data = var[:].filled()
                data["variables_data"][var_name] = {
                    "dimensions": var.dimensions,
                    "data": var_data.tolist(),
                }

            yield simplejson.dumps(data, default=custom_encoder)

    def convert_cerv2_data_to_json_chunks(
        self, netCDF4_file, filter, longitude_range, latitude_range, step_size
    ):
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
            variables, time_variables = preprocess_variables(
                dataset, filter, longitude_range, latitude_range, step_size
            )
            if time_variables:
                max_t = max(len(v[1][0, 0]) for v in time_variables)
            if variables:
                shape = variables[0][1].shape
            else:
                shape = time_variables[0][1][:, :, 0].shape

            for x, y in np.ndindex(shape):
                data = {
                    "x": x,
                    "y": y,
                }
                if variables:
                    data["vars"] = {name: data[x, y] for name, data in variables}
                if time_variables:
                    data["timeVars"] = {
                        t: {
                            name: data[x, y, t] if len(data[0, 0]) > t else None
                            for name, data in time_variables
                        }
                        for t in range(max_t)
                    }
                # yield json lines
                yield simplejson.dumps(
                    data, default=custom_encoder, ignore_nan=True
                ) + "||*split*||"


def preprocess_variables(dataset, var_filter, lon_range, lat_range, step_size):
    """
    Preprocess the dataset and split it into variables and time_variables lists.
    """
    variables = []
    time_variables = []
    # Store variables
    for var_name, var in dataset.variables.items():
        if var_name in var_filter:
            if not "south_north" in var.dimensions or not "west_east" in var.dimensions:
                raise NoCoordinatesError(
                    f"this service doesn't handle the variable {var_name} as it doesn't contain the dimensions south_north and west_east"
                )

            var_data = var[:].filled()  # convert masked array to numpy array
            if len(var.dimensions) > 2:
                dim_map = change_dimensions_dict(var.dimensions)
                var_data = var_data.transpose(list(dim_map.values()))
            if lon_range:
                var_data = var_data[int(lon_range[0]) : int(lon_range[1])]
            if lat_range:
                var_data = var_data[:, int(lat_range[0]) : int(lat_range[1])]
            var_data = var_data[::step_size, ::step_size]
            if "time" in var.dimensions:
                time_variables.append((var_name, var_data))
            else:
                variables.append((var_name, var_data))
    return variables, time_variables


def change_dimensions_dict(dimensions):
    """
    Returns a dict mapping the dimensions to an index
    where the known dimensions have the first 3 indexes.
    """
    dim_map = {"west_east": None, "south_north": None}
    for idx, key in enumerate(dimensions):
        if key in dim_map.keys():
            dim_map[key] = idx
        else:
            dim_map[key] = idx
    return dim_map
