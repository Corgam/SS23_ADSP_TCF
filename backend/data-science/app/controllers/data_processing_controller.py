from app.errors import FailedToParseError
from app.services import data_processing_service
from flask import Response, stream_with_context
from flask_restx import Namespace, Resource
from werkzeug.datastructures import FileStorage

api = Namespace("convert-netcdf-to-json", description="Data Processing operations")

upload_parser = api.parser()
upload_parser.add_argument("file", type=FileStorage, location="files", required=True)


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
            # TODO: validate the file before sending response
            json_generator = data_processing_service.convert_netcdf_metadata_to_json(
                netCDF4_file
            )
            return Response(
                stream_with_context(json_generator), mimetype="application/json"
            )
        except Exception as e:
            raise FailedToParseError("Failed to parse provided NetCDF file.")


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
            # TODO: validate the file before sending response
            json_generator = data_processing_service.convert_netcdf_data_to_json(
                netCDF4_file
            )
            return Response(
                stream_with_context(json_generator), mimetype="application/json"
            )
        except Exception as e:
            raise FailedToParseError("Failed to parse provided NetCDF file.")


cerv2_parser = api.parser()
cerv2_parser.add_argument("file", type=FileStorage, location="files", required=True)
cerv2_parser.add_argument("filter_variables", type=str, location="form", required=False)
cerv2_parser.add_argument("isCERv2", type=str, location="form", required=False)
cerv2_parser.add_argument("longitude_range", type=str, location="form", required=False)
cerv2_parser.add_argument("latitude_range", type=str, location="form", required=False)
cerv2_parser.add_argument("step_size", type=str, location="form", required=True)


@api.route("/cerv2-data-chunks")
@api.expect(cerv2_parser)
class ConvertNetCDFDataToJSON(Resource):
    @api.response(200, "Success")
    @api.response(400, "Bad Request")
    def post(self):
        """
        Uploads a NetCDF file and converts its data to JSON.
        """
        args = cerv2_parser.parse_args()
        netCDF4_file = args["file"]
        filter = (
            args.get("filter_variables").split(",")
            if args.get("filter_variables")
            else None
        )
        longitude_range = (
            args.get("longitude_range").split(",")
            if args.get("longitude_range")
            else None
        )
        latitude_range = (
            args.get("latitude_range").split(",")
            if args.get("latitude_range")
            else None
        )
        step_size = int(args.get("step_size")) if args.get("step_size") else 1

        try:
            # TODO: validate the file before sending response
            json_generator = data_processing_service.convert_cerv2_data_to_json_chunks(
                netCDF4_file,
                filter,
                longitude_range,
                latitude_range,
                step_size,
            )
            return Response(
                stream_with_context(json_generator), mimetype="application/json"
            )
        except Exception as e:
            raise FailedToParseError("Failed to parse provided NetCDF file.")
