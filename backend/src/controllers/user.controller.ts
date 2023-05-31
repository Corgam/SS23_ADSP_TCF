import {
  Body,
  Controller,
  Get,
  Post,
  Route,
  SuccessResponse,
  Tags,
  Response,
} from "tsoa";

import type { UserCreateParams } from "../../../common/types";
import UserService from "../services/user.service";

@Route("auth")
@Tags("Authentication")
export class UserController extends Controller {
  private readonly userService = new UserService();

  /**
   * Register a new user.
   * @param body - User registration details.
   */
  @Post("register")
  @Response(422, "The password is too weak.")
  @Response(422, "Invalid email address")
  @Response(409, "The email address is already in use.")
  @Response(400, "Bad Request")
  @SuccessResponse(201, "Created successfully.") // Custom success response
  public async registerUser(
    @Body() body: UserCreateParams,
  ): Promise<void> {
    this.setStatus(201); // set return status 201
    const { email, password } = body;
    await this.userService.register(email, password);
  }

  /**
   * Login a user.
   * @param body - User login details.
   */
  @Post("login")
  @Response(401, "The email address or password is incorrect")
  @Response(400, "Bad Request")
  @SuccessResponse(200, "Successfully Signed In") // Custom success response
  public async loginUser(
    @Body() body: UserCreateParams,
  ): Promise<any> {
    const { email, password } = body;
    await this.userService.signIn(email, password);
  }

  /**
   * Logout a user.
   */
  @Get("logout")
  @Response(400, "Bad Request")
  @SuccessResponse(200, "Successfully Signed Out") // Custom success response
  public async logoutUser(): Promise<void> {
    return this.userService.signOut();
  }
}