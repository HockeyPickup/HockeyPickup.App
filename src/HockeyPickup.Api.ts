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

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfLoginResponse = ApiResponse & {
  /** Response data payload of type T */
  Data?: LoginResponse | null;
};

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
  /** UserBasicResponse Record */
  UserBasicResponse: UserBasicResponse;
}

export interface UserBasicResponse {
  /**
   * Unique identifier for the user
   * @minLength 1
   * @maxLength 128
   */
  Id: string;
  /**
   * UserName of the user
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
   * User's PayPal email address
   * @format email
   * @minLength 1
   * @maxLength 256
   */
  PayPalEmail: string;
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
  /** Indicates if user account is active */
  Active: boolean;
  /** Indicates if the user has preferred status */
  Preferred: boolean;
  /** Indicates if the user has preferred plus status */
  PreferredPlus: boolean;
  /** User's notification preferences */
  NotificationPreference?: NotificationPreference | null;
  /**
   * User's Venmo account
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
  /** Indicates if user has Locker Room 13 access */
  LockerRoom13: boolean;
  /**
   * Date and time when lockout ends
   * @format date-time
   */
  DateCreated?: string | null;
  /**
   * Roles of user
   * @maxItems 256
   */
  Roles?: string[];
}

export enum NotificationPreference {
  None = 0,
  All = 1,
  OnlyMyBuySell = 2,
}

/** Generic API response wrapper */
export interface ApiResponse {
  /** Indicates if the operation was successful */
  Success: boolean;
  /**
   * Optional message providing additional context about the operation
   * @maxLength 500
   */
  Message?: string | null;
  /** List of error details if operation was not successful */
  Errors: ErrorDetail[];
}

/** Detailed error information */
export interface ErrorDetail {
  /**
   * Error code identifying the type of error
   * @maxLength 50
   */
  Code?: string | null;
  /**
   * Human-readable error message
   * @maxLength 500
   */
  Message?: string | null;
  /**
   * Name of the field that caused the error, if applicable
   * @maxLength 100
   */
  Field?: string | null;
}

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  /** @format int32 */
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: any;
}

export interface LoginRequest {
  /**
   * UserName for login (email address)
   * @format email
   * @minLength 1
   * @maxLength 256
   */
  UserName: string;
  /**
   * User's password
   * @minLength 8
   * @maxLength 100
   */
  Password: string;
}

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfAspNetUser = ApiResponse & {
  /** Response data payload of type T */
  Data?: AspNetUser | null;
};

export type AspNetUser = IdentityUserOfString & {
  /** @format date-time */
  LockoutEndDateUtc?: string | null;
  /** @format date-time */
  LockoutEnd?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  /** @format int32 */
  NotificationPreference?: number;
  PayPalEmail?: string | null;
  Active?: boolean;
  Preferred?: boolean;
  VenmoAccount?: string | null;
  MobileLast4?: string | null;
  /** @format decimal */
  Rating?: number;
  PreferredPlus?: boolean;
  EmergencyName?: string | null;
  EmergencyPhone?: string | null;
  LockerRoom13?: boolean;
  /** @format date-time */
  DateCreated?: string;
  Roles?: AspNetRole[];
  BuyerTransactions?: BuySell[] | null;
  SellerTransactions?: BuySell[] | null;
  ActivityLogs?: ActivityLog[] | null;
  Regulars?: Regular[] | null;
};

export type AspNetRole = IdentityRoleOfString & {
  Users?: AspNetUser[];
};

/** Represents a role in the identity system */
export interface IdentityRoleOfString {
  /** Gets or sets the primary key for this role. */
  Id?: string | null;
  /** Gets or sets the name for this role. */
  Name?: string | null;
  /** Gets or sets the normalized name for this role. */
  NormalizedName?: string | null;
  /** A random value that should change whenever a role is persisted to the store */
  ConcurrencyStamp?: string | null;
}

export interface BuySell {
  /** @format int32 */
  BuySellId?: number;
  /** @format int32 */
  SessionId?: number;
  BuyerUserId?: string | null;
  SellerUserId?: string | null;
  SellerNote?: string | null;
  BuyerNote?: string | null;
  PaymentSent?: boolean;
  PaymentReceived?: boolean;
  /** @format date-time */
  CreateDateTime?: string;
  /** @format date-time */
  UpdateDateTime?: string;
  /** @format int32 */
  TeamAssignment?: number;
  SellerNoteFlagged?: boolean;
  BuyerNoteFlagged?: boolean;
  Session?: Session | null;
  Buyer?: AspNetUser | null;
  Seller?: AspNetUser | null;
}

export interface Session {
  /** @format int32 */
  SessionId?: number;
  /** @format date-time */
  CreateDateTime?: string;
  /** @format date-time */
  UpdateDateTime?: string;
  Note?: string | null;
  /** @format date-time */
  SessionDate?: string;
  /** @format int32 */
  RegularSetId?: number | null;
  /** @format int32 */
  BuyDayMinimum?: number | null;
  RegularSet?: RegularSet | null;
  BuySells?: BuySell[];
  ActivityLogs?: ActivityLog[];
  CurrentRosters?: RosterPlayer[];
  BuyingQueues?: BuyingQueue[];
}

export interface RegularSet {
  /** @format int32 */
  RegularSetId?: number;
  Description?: string | null;
  /** @format int32 */
  DayOfWeek?: number;
  /** @format date-time */
  CreateDateTime?: string;
  Sessions?: Session[];
  Regulars?: Regular[];
}

export interface Regular {
  /** @format int32 */
  RegularSetId?: number;
  UserId?: string | null;
  /** @format int32 */
  TeamAssignment?: number;
  /** @format int32 */
  PositionPreference?: number;
  RegularSet?: RegularSet | null;
  User?: AspNetUser | null;
}

export interface ActivityLog {
  /** @format int32 */
  ActivityLogId?: number;
  /** @format int32 */
  SessionId?: number;
  UserId?: string | null;
  /** @format date-time */
  CreateDateTime?: string;
  Activity?: string | null;
  Session?: Session | null;
  User?: AspNetUser | null;
}

export interface RosterPlayer {
  /** @format int32 */
  SessionRosterId?: number;
  UserId?: string;
  FirstName?: string;
  LastName?: string;
  /** @format int32 */
  SessionId?: number;
  /** @format int32 */
  TeamAssignment?: number;
  IsPlaying?: boolean;
  IsRegular?: boolean;
  PlayerStatus?: string;
  /** @format decimal */
  Rating?: number;
  Preferred?: boolean;
  PreferredPlus?: boolean;
  /** @format int32 */
  LastBuySellId?: number | null;
  /** @format date-time */
  JoinedDateTime?: string;
  /** @format int32 */
  Position?: number;
  CurrentPosition?: string;
}

export interface BuyingQueue {
  /** @format int32 */
  BuySellId?: number;
  /** @format int32 */
  SessionId?: number;
  BuyerName?: string | null;
  SellerName?: string | null;
  /** @format int32 */
  TeamAssignment?: number;
  TransactionStatus?: string;
  QueueStatus?: string;
  PaymentSent?: boolean;
  PaymentReceived?: boolean;
  BuyerNote?: string | null;
  SellerNote?: string | null;
}

/** Represents a user in the identity system */
export interface IdentityUserOfString {
  /** Gets or sets the primary key for this user. */
  Id?: string | null;
  /** Gets or sets the user name for this user. */
  UserName?: string | null;
  /** Gets or sets the normalized user name for this user. */
  NormalizedUserName?: string | null;
  /** Gets or sets the email address for this user. */
  Email?: string | null;
  /** Gets or sets the normalized email address for this user. */
  NormalizedEmail?: string | null;
  /** Gets or sets a flag indicating if a user has confirmed their email address. */
  EmailConfirmed?: boolean;
  /** Gets or sets a salted and hashed representation of the password for this user. */
  PasswordHash?: string | null;
  /** A random value that must change whenever a users credentials change (password changed, login removed) */
  SecurityStamp?: string | null;
  /** A random value that must change whenever a user is persisted to the store */
  ConcurrencyStamp?: string | null;
  /** Gets or sets a telephone number for the user. */
  PhoneNumber?: string | null;
  /** Gets or sets a flag indicating if a user has confirmed their telephone address. */
  PhoneNumberConfirmed?: boolean;
  /** Gets or sets a flag indicating if two factor authentication is enabled for this user. */
  TwoFactorEnabled?: boolean;
  /**
   * Gets or sets the date and time, in UTC, when any user lockout ends.
   * @format date-time
   */
  LockoutEnd?: string | null;
  /** Gets or sets a flag indicating if the user could be locked out. */
  LockoutEnabled?: boolean;
  /**
   * Gets or sets the number of failed login attempts for the current user.
   * @format int32
   */
  AccessFailedCount?: number;
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

export interface ServiceBusCommsMessage {
  /** Required message metadata (Type, etc) */
  Metadata: Record<string, string>;
  /** Communication method and destination (Email, SMS, etc) */
  CommunicationMethod: Record<string, string>;
  /** Related entity IDs (Email, SessionId, etc) */
  RelatedEntities: Record<string, string>;
  /** Type-specific message payload data */
  MessageData?: Record<string, string>;
}

export interface User {
  /**
   * Unique identifier for the user
   * @minLength 1
   * @maxLength 128
   */
  Id: string;
  /**
   * User's email address
   * @format email
   * @maxLength 256
   */
  Email?: string | null;
  /**
   * User's username
   * @maxLength 256
   */
  UserName?: string | null;
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
  /** Indicates if email has been confirmed */
  EmailConfirmed: boolean;
  /**
   * Hashed password
   * @maxLength 1024
   */
  PasswordHash?: string | null;
  /**
   * Security stamp for user
   * @maxLength 1024
   */
  SecurityStamp?: string | null;
  /**
   * User's phone number
   * @format phone
   * @maxLength 20
   */
  PhoneNumber?: string | null;
  /** Indicates if phone number has been confirmed */
  PhoneNumberConfirmed: boolean;
  /** Indicates if two-factor authentication is enabled */
  TwoFactorEnabled: boolean;
  /**
   * Date and time when lockout ends
   * @format date-time
   */
  LockoutEndDateUtc?: string | null;
  /** Indicates if lockout is enabled */
  LockoutEnabled: boolean;
  /**
   * Number of failed access attempts
   * @format int32
   * @min 0
   * @max 2147483647
   */
  AccessFailedCount: number;
  /**
   * User's notification preferences
   * @format int32
   * @min 0
   * @max 2147483647
   */
  NotificationPreference: number;
  /**
   * User's PayPal email address
   * @format email
   * @minLength 1
   * @maxLength 256
   */
  PayPalEmail: string;
  /** Indicates if user account is active */
  Active: boolean;
  /** Indicates if user has preferred status */
  Preferred: boolean;
  /**
   * User's Venmo account
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
   * User's rating
   * @format decimal
   * @min 0
   * @max 5
   */
  Rating: number;
  /** Indicates if user has preferred plus status */
  PreferredPlus: boolean;
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
  /** Indicates if user has Locker Room 13 access */
  LockerRoom13: boolean;
  /**
   * Date and time when lockout ends
   * @format date-time
   */
  DateCreated?: string | null;
}

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfObject = ApiResponse & {
  /** Response data payload of type T */
  Data?: any;
};

/** Generic API response wrapper with typed data payload */
export type ApiDataResponse1 = ApiResponse & {
  /** Response data payload of type T */
  Data?: any;
};
