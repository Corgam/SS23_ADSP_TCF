from app.errors import FailedToParseError
from app.services import data_processing_service
from flask import Response, stream_with_context
from flask_restx import Namespace, Resource
from werkzeug.datastructures import FileStorage

# Create a Namespace for the API endpoints
api = Namespace("convert-netcdf-to-json", description="Data Processing operations")

# Define a parser for file upload
upload_parser = api.parser()
upload_parser.add_argument("file", type=FileStorage, location="files", required=True)

# Endpoint to convert NetCDF metadata to JSON
@api.route("/metadata")
@api.expect(upload_parser)
class ConvertNetCDFMetadataToJSON(Resource):
    @api.response(200, "Success")
    @api.response(400, "Bad Request")
    def post(self):
        """
        Uploads a NetCDF file and converts its metadata to JSON.
        """
        args = upload_parser.parse_args()
        netCDF4_file = args["file"]

        try:
            # TODO: Validate the file before sending the response
            json_generator = data_processing_service.convert_netcdf_metadata_to_json(netCDF4_file)
            return Response(stream_with_context(json_generator), mimetype="application/json")
        except Exception as e:
            raise FailedToParseError("Failed to parse the provided NetCDF file.")

# Endpoint to convert NetCDF data to JSON
@api.route("/data")
@api.expect(upload_parser)
class ConvertNetCDFDataToJSON(Resource):
    @api.response(200, "Success")
    @api.response(400, "Bad Request")
    def post(self):
        """
        Uploads a NetCDF file and converts its data to JSON.
        """
        args = upload_parser.parse_args()
        netCDF4_file = args["file"]

        try:
            # TODO: Validate the file before sending the response
            json_generator = data_processing_service.convert_netcdf_data_to_json(netCDF4_file)
            return Response(stream_with_context(json_generator), mimetype="application/json")
        except Exception as e:
            raise FailedToParseError("Failed to parse the provided NetCDF file.")

# Define a parser for CERV2 data conversion
cerv2_parser = api.parser()
cerv2_parser.add_argument("file", type=FileStorage, location="files", required=True)
cerv2_parser.add_argument("filter_variables", type=str, location="form", required=True)
cerv2_parser.add_argument("longitude_range", type=str, location="form", required=False)
cerv2_parser.add_argument("latitude_range", type=str, location="form", required=False)
cerv2_parser.add_argument("step_size", type=str, location="form", required=True)

# Endpoint to convert CERV2 data to JSON chunks
@api.route("/cerv2-data-chunks")
@api.expect(cerv2_parser)
class ConvertCERV2DataToJSONChunks(Resource):
    @api.response(200, "Success")
    @api.response(400, "Bad Request")
    def post(self):
        """
        Uploads a NetCDF file and converts its CERV2 data to JSON chunks.
        """
        args = cerv2_parser.parse_args()
        netCDF4_file = args["file"]
        filter_variables = args.get("filter_variables").split(",") if args.get("filter_variables") else []
        longitude_range = args.get("longitude_range").split(",") if args.get("longitude_range") else []
        latitude_range = args.get("latitude_range").split(",") if args.get("latitude_range") else []
        step_size = int(args["step_size"])

        try:
            # TODO: Validate the file before sending the response
            json_generator = data_processing_service.convert_cerv2_data_to_json_chunks(
                netCDF4_file, filter_variables, longitude_range, latitude_range, step_size
            )
            return Response(stream_with_context(json_generator), mimetype="application/json")
        except Exception as e:
            raise FailedToParseError("Failed to parse the provided NetCDF file.")
