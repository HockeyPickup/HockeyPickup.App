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
  /** UserDetailedResponse Record */
  UserDetailedResponse: UserDetailedResponse;
}

export interface UserDetailedResponse {
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
  /** User's position preferences */
  PositionPreference?: PositionPreference | null;
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
  /**
   * Jersey Number
   * @format int32
   * @min 0
   * @max 98
   */
  JerseyNumber: number;
  /** Indicates if user has Locker Room 13 access */
  LockerRoom13: boolean;
  /**
   * Profile Photo Url
   * @maxLength 256
   */
  PhotoUrl?: string | null;
  /** User's shoot preference */
  Shoots?: ShootPreference | null;
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
  /**
   * User's rating
   * @format decimal
   * @min 0
   * @max 10
   */
  Rating: number;
  /** User's payment methods */
  PaymentMethods?: UserPaymentMethodResponse[] | null;
  /** User's transactions as buyer */
  BuyerTransactions?: BuySellResponse[] | null;
  /** User's transactions as seller */
  SellerTransactions?: BuySellResponse[] | null;
}

export enum NotificationPreference {
  None = 'None',
  All = 'All',
  OnlyMyBuySell = 'OnlyMyBuySell',
}

export enum PositionPreference {
  TBD = 'TBD',
  Forward = 'Forward',
  Defense = 'Defense',
  Goalie = 'Goalie',
}

export enum ShootPreference {
  TBD = 'TBD',
  Left = 'Left',
  Right = 'Right',
}

export interface UserPaymentMethodResponse {
  /**
   * Unique identifier for the payment method
   * @format int32
   */
  UserPaymentMethodId: number;
  /** Type of payment method */
  MethodType: PaymentMethodType;
  /**
   * Payment identifier (email, username, etc.)
   * @minLength 1
   */
  Identifier: string;
  /**
   * Order of preference for this payment method
   * @format int32
   */
  PreferenceOrder: number;
  /** Whether this payment method is currently active */
  IsActive: boolean;
}

export enum PaymentMethodType {
  Unknown = 'Unknown',
  PayPal = 'PayPal',
  Venmo = 'Venmo',
  CashApp = 'CashApp',
  Zelle = 'Zelle',
  Bitcoin = 'Bitcoin',
}

export interface BuySellResponse {
  /**
   * Unique identifier for the BuySell
   * @format int32
   */
  BuySellId: number;
  /**
   * Unique identifier for the session
   * @format int32
   */
  SessionId: number;
  /**
   * Date and time when the session is scheduled
   * @format date-time
   * @minLength 1
   */
  SessionDate: string;
  /**
   * User Id of the buyer
   * @maxLength 128
   */
  BuyerUserId?: string | null;
  /**
   * User Id of the seller
   * @maxLength 128
   */
  SellerUserId?: string | null;
  /** Note from the seller */
  SellerNote?: string | null;
  /** Note from the buyer */
  BuyerNote?: string | null;
  /** Indicates if payment has been sent */
  PaymentSent: boolean;
  /** Indicates if payment has been received */
  PaymentReceived: boolean;
  /**
   * Date and time of transaction creation
   * @format date-time
   * @minLength 1
   */
  CreateDateTime: string;
  /**
   * Date and time of last update
   * @format date-time
   * @minLength 1
   */
  UpdateDateTime: string;
  /** Team assignment for the transaction */
  TeamAssignment: TeamAssignment;
  /**
   * Price for the BuySell (from session)
   * @format decimal
   * @min 0
   * @max 999.99
   */
  Price: number;
  /** Payment method used to complete the BuySell */
  PaymentMethod?: PaymentMethodType | null;
  /**
   * User Id creating BuySell
   * @maxLength 128
   */
  CreateByUserId?: string | null;
  /**
   * User Id updating BuySell
   * @maxLength 128
   */
  UpdateByUserId?: string | null;
  /**
   * Queue position of the Buyer
   * @format int32
   */
  QueuePosition?: number;
  /**
   * Transaction status of BuySell
   * @maxLength 128
   */
  TransactionStatus?: string | null;
  /** Indicates if the seller note has been flagged */
  SellerNoteFlagged: boolean;
  /** Indicates if the buyer note has been flagged */
  BuyerNoteFlagged: boolean;
  /** Buyer details */
  Buyer?: UserDetailedResponse | null;
  /** Seller details */
  Seller?: UserDetailedResponse | null;
}

export enum TeamAssignment {
  TBD = 'TBD',
  Light = 'Light',
  Dark = 'Dark',
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
  NotificationPreference?: NotificationPreference;
  PositionPreference?: PositionPreference;
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
  /** @format int32 */
  JerseyNumber?: number;
  LockerRoom13?: boolean;
  PhotoUrl?: string | null;
  /** @format date-time */
  DateCreated?: string;
  Shoots?: ShootPreference;
  Roles?: AspNetRole[];
  BuyerTransactions?: BuySell[] | null;
  SellerTransactions?: BuySell[] | null;
  ActivityLogs?: ActivityLog[] | null;
  Regulars?: Regular[] | null;
  PaymentMethods?: UserPaymentMethod[];
};

export type AspNetRole = IdentityRoleOfString & {
  Users?: AspNetUser[];
};

export interface IdentityRoleOfString {
  Id?: string | null;
  Name?: string | null;
  NormalizedName?: string | null;
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
  PaymentSent: boolean;
  PaymentReceived: boolean;
  /** @format date-time */
  CreateDateTime?: string;
  /** @format date-time */
  UpdateDateTime?: string;
  TeamAssignment?: TeamAssignment;
  SellerNoteFlagged?: boolean;
  BuyerNoteFlagged?: boolean;
  /** @format decimal */
  Price?: number | null;
  PaymentMethod?: PaymentMethodType | null;
  CreateByUserId?: string | null;
  UpdateByUserId?: string | null;
  TransactionStatus?: string;
  Session?: Session | null;
  Buyer?: AspNetUser | null;
  Seller?: AspNetUser | null;
  CreateByUser?: AspNetUser | null;
  UpdateByUser?: AspNetUser | null;
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
  /** @format decimal */
  Cost?: number | null;
  RegularSet?: RegularSet | null;
  BuySells?: BuySell[];
  ActivityLogs?: ActivityLog[];
  CurrentSessionRoster?: CurrentSessionRoster[];
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
  Archived?: boolean;
  Sessions?: Session[];
  Regulars?: Regular[];
}

export interface Regular {
  /** @format int32 */
  RegularSetId?: number;
  UserId?: string | null;
  TeamAssignment?: TeamAssignment;
  PositionPreference?: PositionPreference;
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

export interface CurrentSessionRoster {
  /** @format int32 */
  SessionRosterId?: number;
  UserId?: string;
  Email?: string;
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
  PhotoUrl?: string;
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
  BuyerUserId?: string | null;
  BuyerName?: string | null;
  SellerUserId?: string | null;
  SellerName?: string | null;
  TeamAssignment?: TeamAssignment;
  TransactionStatus?: string;
  QueueStatus?: string;
  PaymentSent?: boolean;
  PaymentReceived?: boolean;
  BuyerNote?: string | null;
  SellerNote?: string | null;
  Buyer?: AspNetUser | null;
  Seller?: AspNetUser | null;
}

export interface UserPaymentMethod {
  /** @format int32 */
  UserPaymentMethodId?: number;
  /**
   * @minLength 1
   * @maxLength 128
   */
  UserId: string;
  MethodType: PaymentMethodType;
  /**
   * @minLength 1
   * @maxLength 256
   */
  Identifier: string;
  /** @format int32 */
  PreferenceOrder: number;
  IsActive: boolean;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  UpdatedAt?: string | null;
  User?: AspNetUser;
}

export interface IdentityUserOfString {
  Id?: string | null;
  UserName?: string | null;
  NormalizedUserName?: string | null;
  Email?: string | null;
  NormalizedEmail?: string | null;
  EmailConfirmed?: boolean;
  PasswordHash?: string | null;
  SecurityStamp?: string | null;
  ConcurrencyStamp?: string | null;
  PhoneNumber?: string | null;
  PhoneNumberConfirmed?: boolean;
  TwoFactorEnabled?: boolean;
  /** @format date-time */
  LockoutEnd?: string | null;
  LockoutEnabled?: boolean;
  /** @format int32 */
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
   * @pattern ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$
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
   * @pattern ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$
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
  /**
   * Jersey Number
   * @format int32
   * @min 0
   * @max 98
   */
  JerseyNumber: number;
  /** User's notification preference setting */
  NotificationPreference?: NotificationPreference | null;
  /** User's position preference setting */
  PositionPreference?: PositionPreference | null;
  /** User's shoot preference setting */
  Shoots?: ShootPreference | null;
}

export type AdminUserUpdateRequest = SaveUserRequestEx & {
  /**
   * Id of the user to update
   * @minLength 1
   * @maxLength 128
   */
  UserId: string;
};

export type SaveUserRequestEx = SaveUserRequest & {
  /** Whether the user account is active */
  Active?: boolean | null;
  /** Whether the user has preferred status */
  Preferred?: boolean | null;
  /** Whether the user has preferred plus status */
  PreferredPlus?: boolean | null;
  /** Whether the user has Locker Room 13 access */
  LockerRoom13?: boolean | null;
  /**
   * User's rating
   * @format decimal
   * @min 0
   * @max 10
   */
  Rating?: number | null;
};

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfPhotoResponse = ApiResponse & {
  /** Response data payload of type T */
  Data?: PhotoResponse | null;
};

export interface PhotoResponse {
  /**
   * URL of the uploaded profile photo
   * @format uri
   * @minLength 1
   */
  PhotoUrl: string;
  /**
   * Date and time when the photo was last updated
   * @format date-time
   */
  UpdateDateTime?: string;
}

export interface AdminPhotoDeleteRequest {
  /**
   * User identifier whose photo should be deleted
   * @minLength 1
   * @maxLength 128
   */
  UserId: string;
}

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfBuySellResponse = ApiResponse & {
  /** Response data payload of type T */
  Data?: BuySellResponse | null;
};

export interface BuyRequest {
  /**
   * Session identifier
   * @format int32
   */
  SessionId: number;
  /**
   * Buyer's note for the BuySell
   * @maxLength 4000
   */
  Note?: string | null;
}

export interface SellRequest {
  /**
   * Session identifier
   * @format int32
   */
  SessionId: number;
  /**
   * Seller's note for the BuySell
   * @maxLength 4000
   */
  Note?: string | null;
}

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfIEnumerableOfBuySellResponse = ApiResponse & {
  /** Response data payload of type T */
  Data?: BuySellResponse[] | null;
};

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfBuySellStatusResponse = ApiResponse & {
  /** Response data payload of type T */
  Data?: BuySellStatusResponse | null;
};

export interface BuySellStatusResponse {
  /** Indicates if the action is allowed */
  IsAllowed: boolean;
  /**
   * Explanation of why action is/isn't allowed
   * @minLength 1
   */
  Reason: string;
  /**
   * Time until action is allowed (if applicable)
   * @format duration
   */
  TimeUntilAllowed?: string | null;
}

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfString = ApiResponse & {
  /** Response data payload of type T */
  Data?: string | null;
};

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfImpersonationResponse = ApiResponse & {
  /** Response data payload of type T */
  Data?: ImpersonationResponse | null;
};

export interface ImpersonationResponse {
  /**
   * JWT token for impersonation session
   * @minLength 1
   * @maxLength 2048
   */
  Token: string;
  /**
   * User Id of the impersonated user
   * @minLength 1
   * @maxLength 128
   */
  ImpersonatedUserId: string;
  /**
   * User Id of the original admin user
   * @minLength 1
   * @maxLength 128
   */
  OriginalUserId: string;
  /** Details of the impersonated user */
  ImpersonatedUser?: UserDetailedResponse | null;
  /**
   * Timestamp when impersonation started
   * @format date-time
   * @minLength 1
   */
  StartTime: string;
}

export interface ImpersonationRequest {
  /**
   * User Id of the target user to impersonate
   * @minLength 1
   * @maxLength 128
   */
  TargetUserId: string;
}

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfRevertImpersonationResponse = ApiResponse & {
  /** Response data payload of type T */
  Data?: RevertImpersonationResponse | null;
};

export interface RevertImpersonationResponse {
  /**
   * New JWT token for original admin user
   * @minLength 1
   * @maxLength 2048
   */
  Token: string;
  /**
   * User Id of the original admin user
   * @minLength 1
   * @maxLength 128
   */
  OriginalUserId: string;
  /**
   * Timestamp when impersonation ended
   * @format date-time
   * @minLength 1
   */
  EndTime: string;
}

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfImpersonationStatusResponse = ApiResponse & {
  /** Response data payload of type T */
  Data?: ImpersonationStatusResponse | null;
};

export interface ImpersonationStatusResponse {
  /** Indicates if user is currently impersonating another user */
  IsImpersonating: boolean;
  /**
   * Original admin user Id if impersonating
   * @maxLength 128
   */
  OriginalUserId?: string | null;
  /**
   * Currently impersonated user Id
   * @maxLength 128
   */
  ImpersonatedUserId?: string | null;
  /**
   * Start time of current impersonation session
   * @format date-time
   */
  StartTime?: string | null;
}

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfRegularSetDetailedResponse = ApiResponse & {
  /** Response data payload of type T */
  Data?: RegularSetDetailedResponse | null;
};

export interface RegularSetDetailedResponse {
  /**
   * Unique identifier for the regular set
   * @format int32
   */
  RegularSetId: number;
  /** Description of the regular set */
  Description?: string | null;
  /**
   * Day of the week (0 = Sunday, 6 = Saturday)
   * @format int32
   * @min 0
   * @max 6
   */
  DayOfWeek: number;
  /**
   * Date and time when the regular set was created
   * @format date-time
   * @minLength 1
   */
  CreateDateTime: string;
  /** Indicates if the regular set is archived */
  Archived: boolean;
  /** List of regular players in this set */
  Regulars?: RegularDetailedResponse[] | null;
}

export interface RegularDetailedResponse {
  /**
   * Regular set identifier
   * @format int32
   */
  RegularSetId: number;
  /**
   * User identifier
   * @minLength 1
   */
  UserId: string;
  /** Team assignment for the regular player */
  TeamAssignment: TeamAssignment;
  /** Position preference for the regular player */
  PositionPreference: PositionPreference;
  /** Detailed user information */
  User?: UserDetailedResponse | null;
}

export interface DuplicateRegularSetRequest {
  /**
   * Regular Set identifier
   * @format int32
   */
  RegularSetId: number;
  /**
   * New Regular Set description
   * @minLength 1
   */
  Description: string;
}

export interface UpdateRegularSetRequest {
  /**
   * Regular Set identifier
   * @format int32
   */
  RegularSetId: number;
  /**
   * Description of the regular set
   * @minLength 1
   */
  Description: string;
  /**
   * Day of the week (0 = Sunday, 6 = Saturday)
   * @format int32
   * @min 0
   * @max 6
   */
  DayOfWeek: number;
  /** Indicates if the regular set is archived */
  Archived: boolean;
}

export interface UpdateRegularPositionRequest {
  /**
   * Regular Set Id
   * @format int32
   */
  RegularSetId: number;
  /**
   * User Id
   * @minLength 1
   */
  UserId: string;
  /** New position (0: TBD, 1: Forward, 2: Defense) */
  NewPosition: PositionPreference;
}

export interface UpdateRegularTeamRequest {
  /**
   * Regular Set Id
   * @format int32
   */
  RegularSetId: number;
  /**
   * User Id
   * @minLength 1
   */
  UserId: string;
  /** New team assignment (1: Light, 2: Dark) */
  NewTeamAssignment: TeamAssignment;
}

export interface AddRegularRequest {
  /**
   * Regular set identifier
   * @format int32
   * @min 1
   * @max 2147483647
   */
  RegularSetId: number;
  /**
   * User identifier
   * @minLength 1
   * @maxLength 128
   */
  UserId: string;
  /** Team assignment (1 for Light, 2 for Dark) */
  TeamAssignment: TeamAssignment;
  /** Position preference (0 for TBD, 1 for Forward, 2 for Defense, 3 for Goalie) */
  PositionPreference: PositionPreference;
}

export interface CreateRegularSetRequest {
  /**
   * Description of the regular set
   * @minLength 1
   */
  Description: string;
  /**
   * Day of the week (0 = Sunday, 6 = Saturday)
   * @format int32
   * @min 0
   * @max 6
   */
  DayOfWeek: number;
}

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfSessionDetailedResponse = ApiResponse & {
  /** Response data payload of type T */
  Data?: SessionDetailedResponse | null;
};

export type SessionDetailedResponse = SessionBasicResponse & {
  /**
   * Buy window for the session
   * @format date-time
   */
  BuyWindow?: string;
  /**
   * Buy window for preferred users
   * @format date-time
   */
  BuyWindowPreferred?: string;
  /**
   * Buy window for preferred plus users
   * @format date-time
   */
  BuyWindowPreferredPlus?: string;
  /** Buy/sell transactions associated with the session */
  BuySells?: BuySellResponse[] | null;
  /** Activity logs associated with the session */
  ActivityLogs?: ActivityLogResponse[] | null;
  /** Regular set details for the session */
  RegularSet?: RegularSetResponse | null;
  /** Current roster state for the session */
  CurrentRosters?: RosterPlayer[] | null;
  /** Buying queue for the session */
  BuyingQueues?: BuyingQueueItem[] | null;
};

export interface ActivityLogResponse {
  /**
   * Unique identifier for the activity log
   * @format int32
   */
  ActivityLogId: number;
  /**
   * User Id associated with the activity
   * @maxLength 128
   */
  UserId?: string | null;
  /**
   * Date and time of the activity
   * @format date-time
   * @minLength 1
   */
  CreateDateTime: string;
  /** Description of the activity */
  Activity?: string | null;
  /** User details */
  User?: UserDetailedResponse | null;
}

export interface RegularSetResponse {
  /**
   * Unique identifier for the regular set
   * @format int32
   */
  RegularSetId: number;
  /** Description of the regular set */
  Description?: string | null;
  /**
   * Day of the week
   * @format int32
   * @min 0
   * @max 6
   */
  DayOfWeek: number;
  /**
   * Date and time of creation
   * @format date-time
   * @minLength 1
   */
  CreateDateTime: string;
  /** Indicates if the regular set is archived */
  Archived: boolean;
  /** Regular players in the set */
  Regulars?: RegularResponse[] | null;
}

export interface RegularResponse {
  /**
   * Regular set identifier
   * @format int32
   */
  RegularSetId: number;
  /**
   * User Id of the regular player
   * @maxLength 128
   */
  UserId?: string | null;
  /** Team assignment for the regular player */
  TeamAssignment: TeamAssignment;
  /** Position preference for the regular player */
  PositionPreference: PositionPreference;
  /** User details */
  User?: UserDetailedResponse | null;
}

export interface RosterPlayer {
  /**
   * Unique identifier for the roster entry
   * @format int32
   */
  SessionRosterId: number;
  /**
   * Session identifier
   * @format int32
   */
  SessionId: number;
  /**
   * User identifier
   * @minLength 1
   * @maxLength 128
   */
  UserId: string;
  /**
   * Email address of the user
   * @format email
   * @minLength 1
   * @maxLength 256
   */
  Email: string;
  /**
   * First name of the player
   * @minLength 1
   * @maxLength 256
   */
  FirstName: string;
  /**
   * Last name of the player
   * @minLength 1
   * @maxLength 256
   */
  LastName: string;
  /** Team assignment (1 for Light, 2 for Dark) */
  TeamAssignment: TeamAssignment;
  /** Position for the player */
  Position: PositionPreference;
  /**
   * Position name for the player
   * @minLength 1
   * @maxLength 256
   */
  CurrentPosition: string;
  /** Indicates if the player is currently playing */
  IsPlaying: boolean;
  /** Indicates if the player is a regular */
  IsRegular: boolean;
  /** Player's status in the roster */
  PlayerStatus: PlayerStatus;
  /**
   * Player's rating
   * @format decimal
   */
  Rating: number;
  /** Indicates if the player has preferred status */
  Preferred: boolean;
  /**
   * Profile Photo Url
   * @minLength 1
   * @maxLength 256
   */
  PhotoUrl: string;
  /** Indicates if the player has preferred plus status */
  PreferredPlus: boolean;
  /**
   * Last buy/sell transaction Id affecting this roster position
   * @format int32
   */
  LastBuySellId?: number | null;
  /**
   * Date and time when the player joined the roster
   * @format date-time
   * @minLength 1
   */
  JoinedDateTime: string;
}

export enum PlayerStatus {
  NotPlaying = 'NotPlaying',
  Regular = 'Regular',
  Substitute = 'Substitute',
  InQueue = 'InQueue',
}

export interface BuyingQueueItem {
  /**
   * Unique identifier for the buy/sell transaction
   * @format int32
   */
  BuySellId: number;
  /**
   * Session identifier
   * @format int32
   */
  SessionId: number;
  /**
   * User Id of the buyer
   * @maxLength 128
   */
  BuyerUserId?: string | null;
  /**
   * User Id of the seller
   * @maxLength 128
   */
  SellerUserId?: string | null;
  /**
   * Name of the buyer
   * @maxLength 512
   */
  BuyerName?: string | null;
  /**
   * Name of the seller
   * @maxLength 512
   */
  SellerName?: string | null;
  /** Team assignment (1 for Light, 2 for Dark) */
  TeamAssignment: TeamAssignment;
  /**
   * Current status of the transaction
   * @minLength 1
   * @maxLength 50
   */
  TransactionStatus: string;
  /**
   * Position in the buying queue
   * @minLength 1
   * @maxLength 50
   */
  QueueStatus: string;
  /** Indicates if payment has been sent */
  PaymentSent: boolean;
  /** Indicates if payment has been received */
  PaymentReceived: boolean;
  /**
   * Note from the buyer
   * @maxLength 4000
   */
  BuyerNote?: string | null;
  /**
   * Note from the seller
   * @maxLength 4000
   */
  SellerNote?: string | null;
  /** Buyer details */
  Buyer?: UserDetailedResponse | null;
  /** Seller details */
  Seller?: UserDetailedResponse | null;
}

export interface SessionBasicResponse {
  /**
   * Unique identifier for the session
   * @format int32
   */
  SessionId: number;
  /**
   * Date and time when the session was created
   * @format date-time
   * @minLength 1
   */
  CreateDateTime: string;
  /**
   * Date and time when the session was last updated
   * @format date-time
   * @minLength 1
   */
  UpdateDateTime: string;
  /** Additional notes about the session */
  Note?: string | null;
  /**
   * Date and time when the session is scheduled
   * @format date-time
   * @minLength 1
   */
  SessionDate: string;
  /**
   * Associated regular set identifier
   * @format int32
   */
  RegularSetId?: number | null;
  /**
   * Minimum number of days before session to allow buying
   * @format int32
   * @min 0
   * @max 365
   */
  BuyDayMinimum?: number | null;
  /**
   * Cost of the session
   * @format decimal
   */
  Cost?: number | null;
}

export interface CreateSessionRequest {
  /**
   * Date and time when the session is scheduled
   * @format date-time
   * @minLength 1
   */
  SessionDate: string;
  /**
   * Notes about the session
   * @maxLength 4000
   */
  Note?: string | null;
  /**
   * Associated regular set identifier
   * @format int32
   */
  RegularSetId: number;
  /**
   * Minimum number of days before session to allow buying
   * @format int32
   * @min 0
   * @max 365
   */
  BuyDayMinimum?: number;
  /**
   * Cost of the session
   * @format decimal
   * @min 0
   * @max 1000
   */
  Cost?: number;
}

export type UpdateSessionRequest = CreateSessionRequest & {
  /**
   * Unique identifier for the session
   * @format int32
   */
  SessionId: number;
};

export interface UpdateRosterPositionRequest {
  /**
   * Session Id
   * @format int32
   */
  SessionId: number;
  /**
   * User Id
   * @minLength 1
   */
  UserId: string;
  /** New position (0: TBD, 1: Forward, 2: Defense) */
  NewPosition: PositionPreference;
}

export interface UpdateRosterTeamRequest {
  /**
   * Session Id
   * @format int32
   */
  SessionId: number;
  /**
   * User Id
   * @minLength 1
   */
  UserId: string;
  /** New team assignment (0 for TBD, 1 for Light, 2 for Dark) */
  NewTeamAssignment: TeamAssignment;
}

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfBoolean = ApiResponse & {
  /** Response data payload of type T */
  Data?: boolean;
};

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfUserPaymentMethodResponse = ApiResponse & {
  /** Response data payload of type T */
  Data?: UserPaymentMethodResponse | null;
};

export interface UserPaymentMethodRequest {
  /** Type of payment method */
  MethodType: PaymentMethodType;
  /**
   * Payment identifier (email, username, etc.)
   * @minLength 1
   * @maxLength 256
   */
  Identifier: string;
  /**
   * Order of preference for this payment method
   * @format int32
   * @min 1
   * @max 100
   */
  PreferenceOrder: number;
  /** Whether this payment method is active */
  IsActive?: boolean;
}

/** Generic API response wrapper with typed data payload */
export type ApiDataResponseOfIEnumerableOfUserPaymentMethodResponse = ApiResponse & {
  /** Response data payload of type T */
  Data?: UserPaymentMethodResponse[] | null;
};

export interface LockerRoom13Players {
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
  /** Indicates if user has Locker Room 13 access */
  LockerRoom13: boolean;
  /** Player's status in the roster */
  PlayerStatus: PlayerStatus;
}

export interface LockerRoom13Response {
  /**
   * Unique identifier for the session
   * @format int32
   */
  SessionId: number;
  /**
   * Date and time when the session is scheduled
   * @format date-time
   * @minLength 1
   */
  SessionDate: string;
  /** List of players in LockerRoom13 */
  LockerRoom13Players: LockerRoom13Players[];
}

export interface ServiceBusCommsMessage {
  /** Required message metadata (Type, etc) */
  Metadata: Record<string, string>;
  /** Communication method and destination (Email, SMS, etc) */
  CommunicationMethod: Record<string, string>;
  /** Related entity IDs (Email, SessionId, etc) */
  RelatedEntities: Record<string, string>;
  /** Type-specific message payload data */
  MessageData?: Record<string, string>;
  /** List of email addresses to notify */
  NotificationEmails?: string[] | null;
  /** List of device IDs for push notifications */
  NotificationDeviceIds?: string[] | null;
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
  /** User's notification preferences */
  NotificationPreference: NotificationPreference;
  /** User's position preferences */
  PositionPreference: PositionPreference;
  /** User's shooting preference */
  Shoots: ShootPreference;
  /** Indicates if user account is active */
  Active: boolean;
  /** Indicates if user has preferred status */
  Preferred: boolean;
  /**
   * User's rating
   * @format decimal
   * @min 0
   * @max 10
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
  /**
   * Jersey Number
   * @format int32
   * @min 0
   * @max 98
   */
  JerseyNumber: number;
  /** Indicates if user has Locker Room 13 access */
  LockerRoom13: boolean;
  /**
   * Profile Photo Url
   * @maxLength 256
   */
  PhotoUrl?: string | null;
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

export interface UserStatsResponse {
  /**
   * Date when user became a member
   * @format date-time
   * @minLength 1
   */
  MemberSince: string;
  /**
   * Games played in current year
   * @format int32
   */
  CurrentYearGamesPlayed: number;
  /**
   * Games played in prior year
   * @format int32
   */
  PriorYearGamesPlayed: number;
  /**
   * Spots bought in current year
   * @format int32
   */
  CurrentYearBoughtTotal: number;
  /**
   * Spots bought in prior year
   * @format int32
   */
  PriorYearBoughtTotal: number;
  /**
   * Date of last bought session
   * @format date-time
   */
  LastBoughtSessionDate?: string | null;
  /**
   * Spots sold in current year
   * @format int32
   */
  CurrentYearSoldTotal: number;
  /**
   * Spots sold in prior year
   * @format int32
   */
  PriorYearSoldTotal: number;
  /**
   * Games played two years ago
   * @format int32
   */
  TwoYearsAgoGamesPlayed: number;
  /**
   * Spots bought two years ago
   * @format int32
   */
  TwoYearsAgoBoughtTotal: number;
  /**
   * Spots sold two years ago
   * @format int32
   */
  TwoYearsAgoSoldTotal: number;
  /**
   * Date of last sold session
   * @format date-time
   */
  LastSoldSessionDate?: string | null;
  /** Most frequently played position */
  MostPlayedPosition?: string | null;
  /**
   * Current active buy requests
   * @format int32
   */
  CurrentBuyRequests: number;
  /** Indicates if user is a regular for upcoming Wednesday sessions */
  WednesdayRegular: boolean;
  /** Indicates if user is a regular for upcoming Friday sessions */
  FridayRegular: boolean;
}
