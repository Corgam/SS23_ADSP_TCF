from flask import request, Response, stream_with_context
from flask_restx import Namespace, Resource
from app.services import data_processing_service
from werkzeug.datastructures import FileStorage
from app.errors import FailedToParseError

api = Namespace('convert-netcdf-to-json', description='Data Processing operations')

upload_parser = api.parser()
upload_parser.add_argument('file', type=FileStorage, location='files', required=True)

@api.route('/metadata')
@api.expect(upload_parser)
class ConvertNetCDFMetadataToJSON(Resource):
    @api.response(200, 'Success')
    @api.response(400, 'Bad Request')
    def post(self):
        """
        Uploads a NetCDF file and converts its metadata to JSON.
        """
        args = upload_parser.parse_args()
        netCDF4_file = args['file']

        try:
            # TODO: validate the file before sending response
            json_generator = data_processing_service.convert_netcdf_metadata_to_json(netCDF4_file)
            return Response(
                stream_with_context(json_generator),
                mimetype='application/json'
            )
        except Exception as e:
            raise FailedToParseError("Failed to parse provided NetCDF file.")

@api.route('/data')
@api.expect(upload_parser)
class ConvertNetCDFDataToJSON(Resource):
    @api.response(200, 'Success')
    @api.response(400, 'Bad Request')
    def post(self):
        """
        Uploads a NetCDF file and converts its data to JSON.
        """
        args = upload_parser.parse_args()
        netCDF4_file = args['file']

        try:
            # TODO: validate the file before sending response
            json_generator = data_processing_service.convert_netcdf_data_to_json(netCDF4_file)
            return Response(
                stream_with_context(json_generator),
                mimetype='application/json'
            )
        except Exception as e:
            raise FailedToParseError("Failed to parse provided NetCDF file.")
