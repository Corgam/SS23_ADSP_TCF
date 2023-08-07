import unittest

import numpy as np
from app.errors.errors import NoCoordinatesError
from app.services.data_processing_service import (
    change_dimensions_dict,
    custom_encoder,
    preprocess_variables,
)
from netCDF4 import Dataset


class TestYourModule(unittest.TestCase):
    def setUp(self):
        # Create a dummy netcdf dataset for testing
        self.file_path = "test_dataset.nc"
        self.dataset = Dataset(self.file_path, "w")
        self.dataset.createDimension("south_north", 10)
        self.dataset.createDimension("west_east", 10)
        self.dataset.createDimension("time", 10)
        self.dataset.createVariable(
            "variable", np.float32, ("south_north", "west_east")
        )
        self.dataset.createVariable(
            "time_variable", np.float32, ("south_north", "west_east", "time")
        )
        self.dataset.createVariable("bad_variable", np.float32, ("time"))

    def tearDown(self):
        # Close the dataset after each test
        self.dataset.close()

    def test_preprocess_variables_with_time_dimension(self):
        var_filter = ["time_variable"]
        lon_range = [2, 8]
        lat_range = [2, 8]
        step_size = 2
        _, time_variables = preprocess_variables(
            self.dataset, var_filter, lon_range, lat_range, step_size
        )
        # Assuming the function change_dimensions_dict works correctly
        expected_var_data = self.dataset.variables["time_variable"][2:8, 2:8][::2, ::2]
        for name, data in time_variables:
            self.assertEqual(name, "time_variable")
            np.testing.assert_array_equal(data, expected_var_data)

    def test_preprocess_variables_without_time_dimension(self):
        var_filter = ["variable"]
        lon_range = [2, 8]
        lat_range = [2, 8]
        step_size = 2
        variables, _ = preprocess_variables(
            self.dataset, var_filter, lon_range, lat_range, step_size
        )
        # Assuming the function change_dimensions_dict works correctly
        expected_var_data = self.dataset.variables["variable"][2:8, 2:8][::2, ::2]
        for name, data in variables:
            self.assertEqual(name, "variable")
            np.testing.assert_array_equal(data, expected_var_data)

    def test_invalid_variable_dimensions(self):
        var_filter = ["bad_variable"]
        lon_range = [2, 8]
        lat_range = [2, 8]
        step_size = 2
        with self.assertRaises(NoCoordinatesError):
            preprocess_variables(
                self.dataset, var_filter, lon_range, lat_range, step_size
            )

    def test_encode_np_float32_array(self):
        arr = np.array([1.5, 2.2, 4.4], dtype=np.float32)
        expected_result = [1.5, 2.2, 4.4]
        np.testing.assert_almost_equal(custom_encoder(arr), expected_result)

    def test_encode_np_int32_array(self):
        arr = np.array([10, 20, 30], dtype=np.int32)
        expected_result = [10, 20, 30]
        self.assertEqual(custom_encoder(arr), expected_result)

    def test_encode_np_float32_scalar(self):
        val = np.float32(1.5)
        expected_result = 1.5
        self.assertEqual(custom_encoder(val), expected_result)

    def test_encode_np_int32_scalar(self):
        val = np.int32(10)
        expected_result = 10
        self.assertEqual(custom_encoder(val), expected_result)

    def test_encode_non_serializable_object(self):
        obj = {"a": np.array([1, 2, 3])}
        with self.assertRaises(TypeError):
            custom_encoder(obj)

    def test_known_dimensions(self):
        dimensions = ["west_east", "south_north", "up_down", "time"]
        expected_result = {"west_east": 0, "south_north": 1, "up_down": 2, "time": 3}
        self.assertEqual(change_dimensions_dict(dimensions), expected_result)

    def test_known_dimensions_unordered(self):
        dimensions = ["time", "west_east", "south_north"]
        expected_result = {"west_east": 1, "south_north": 2, "time": 0}
        self.assertEqual(change_dimensions_dict(dimensions), expected_result)
