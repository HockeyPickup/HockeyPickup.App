/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  /** @format int32 */
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: any;
}

export interface LoginResponse {
  /**
   * JWT authentication token
   * @minLength 1
   * @maxLength 2048
   */
  Token: string;
  /**
   * Token expiration date and time
   * @format date-time
   * @minLength 1
   */
  Expiration: string;
}

export interface LoginRequest {
  /**
   * Username for login (email address)
   * @format email
   * @minLength 1
   * @maxLength 256
   */
  Username: string;
  /**
   * User's password
   * @minLength 8
   * @maxLength 100
   */
  Password: string;
}

export interface RegisterResponse {
  /** Indicates if registration was successful */
  Success: boolean;
  /**
   * Response message describing the registration result
   * @minLength 1
   * @maxLength 1024
   */
  Message: string;
  /** Collection of error messages if registration failed */
  Errors?: string[];
}

export interface RegisterRequest {
  /**
   * Frontend URL for email confirmation link
   * @format uri
   * @minLength 1
   * @maxLength 2048
   */
  FrontendUrl: string;
  /**
   * Invitation code required for registration
   * @minLength 0
   * @maxLength 50
   */
  InviteCode: string;
  /**
   * Email address for registration
   * @format email
   * @minLength 1
   * @maxLength 256
   */
  Email: string;
  /**
   * User's password
   * @minLength 8
   * @maxLength 100
   * @pattern ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$
   */
  Password: string;
  /**
   * Confirmation of password
   * @minLength 1
   * @maxLength 100
   */
  ConfirmPassword: string;
  /**
   * User's first name
   * @minLength 0
   * @maxLength 50
   */
  FirstName: string;
  /**
   * User's last name
   * @minLength 0
   * @maxLength 50
   */
  LastName: string;
}

export interface ConfirmEmailResponse {
  /** Indicates if email confirmation was successful */
  Success: boolean;
  /**
   * Response message describing the confirmation result
   * @minLength 1
   * @maxLength 1024
   */
  Message: string;
}

export interface ConfirmEmailRequest {
  /**
   * Email confirmation token
   * @minLength 1
   * @maxLength 1024
   */
  Token: string;
  /**
   * Email address to confirm
   * @format email
   * @minLength 1
   * @maxLength 256
   */
  Email: string;
}

export interface ChangePasswordRequest {
  /**
   * User's current password
   * @minLength 8
   * @maxLength 100
   */
  CurrentPassword: string;
  /**
   * New password to set
   * @minLength 8
   * @maxLength 100
   */
  NewPassword: string;
  /**
   * Confirmation of new password
   * @minLength 8
   * @maxLength 100
   */
  ConfirmNewPassword: string;
}

export interface ForgotPasswordRequest {
  /**
   * Frontend URL for password reset link
   * @format uri
   * @minLength 1
   * @maxLength 2048
   */
  FrontendUrl: string;
  /**
   * Email address for password reset
   * @format email
   * @minLength 1
   * @maxLength 256
   */
  Email: string;
}

export interface ResetPasswordRequest {
  /**
   * Email address associated with reset request
   * @format email
   * @minLength 1
   * @maxLength 256
   */
  Email: string;
  /**
   * Password reset token from email
   * @minLength 1
   * @maxLength 1024
   */
  Token: string;
  /**
   * New password to set
   * @minLength 8
   * @maxLength 100
   * @pattern ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$
   */
  NewPassword: string;
  /**
   * Confirmation of new password
   * @minLength 1
   * @maxLength 100
   */
  ConfirmPassword: string;
}

export interface SaveUserRequest {
  /**
   * User's first name
   * @maxLength 256
   */
  FirstName?: string | null;
  /**
   * User's last name
   * @maxLength 256
   */
  LastName?: string | null;
  /**
   * PayPal email address for payments
   * @format email
   * @maxLength 256
   */
  PayPalEmail?: string | null;
  /**
   * Venmo Account
   * Venmo account name for payments
   * @maxLength 255
   * @pattern ^[^\\\./:\@\*\?\"<>\|]{1}[^\\/:\@\*\?\"<>\|]{0,254}$
   */
  VenmoAccount?: string | null;
  /**
   * Last 4 digits of mobile number
   * @maxLength 4
   * @pattern ^(\d{4})$
   */
  MobileLast4?: string | null;
  /**
   * Emergency contact name
   * @maxLength 256
   */
  EmergencyName?: string | null;
  /**
   * Emergency contact phone number
   * @format phone
   * @maxLength 20
   */
  EmergencyPhone?: string | null;
  /** User's notification preference setting */
  NotificationPreference?: NotificationPreference | null;
  /** Whether the user account is active */
  Active?: boolean | null;
  /** Whether the user has preferred status */
  Preferred?: boolean | null;
  /** Whether the user has preferred plus status */
  PreferredPlus?: boolean | null;
  /** Whether the user has locker room 13 access */
  LockerRoom13?: boolean | null;
}

export enum NotificationPreference {
  None = 0,
  All = 1,
  OnlyMyBuySell = 2,
}

export type UserDetailedResponse = UserBasicResponse & {
  /**
   * User's rating
   * @format decimal
   * @min 0
   * @max 5
   */
  Rating: number;
};

export interface UserBasicResponse {
  /**
   * Unique identifier for the user
   * @minLength 1
   * @maxLength 128
   */
  Id: string;
  /**
   * Username of the user
   * @minLength 1
   * @maxLength 256
   */
  UserName: string;
  /**
   * Email address of the user
   * @format email
   * @maxLength 256
   */
  Email?: string | null;
  /**
   * First name of the user
   * @maxLength 256
   */
  FirstName?: string | null;
  /**
   * Last name of the user
   * @maxLength 256
   */
  LastName?: string | null;
  /** Indicates if the user has preferred status */
  IsPreferred: boolean;
  /** Indicates if the user has preferred plus status */
  IsPreferredPlus: boolean;
  /** Current team assignment */
  TeamAssignment?: TeamAssignment | null;
  /** User's preferred position */
  PositionPreference?: PositionPreference | null;
  /** User's notification preferences */
  NotificationPreference?: NotificationPreference | null;
}

export enum TeamAssignment {
  Unassigned = 0,
  Light = 1,
  Dark = 2,
}

export enum PositionPreference {
  None = 0,
  Forward = 1,
  Defense = 2,
}
