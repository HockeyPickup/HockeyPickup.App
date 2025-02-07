import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query UsersEx {
    UsersEx {
      Id
      UserName
      Email
      FirstName
      LastName
      Active
      Preferred
      PreferredPlus
      NotificationPreference
      PositionPreference
      Shoots
      EmergencyName
      EmergencyPhone
      JerseyNumber
      PhotoUrl
      LockerRoom13
      DateCreated
      Roles
      Rating
    }
  }
`;

export const GET_SESSIONS = gql`
  query Sessions {
    Sessions {
      SessionId
      CreateDateTime
      UpdateDateTime
      Note
      SessionDate
      RegularSetId
      BuyDayMinimum
      Cost
    }
  }
`;

export const GET_SESSION = gql`
  query Session($SessionId: Int!) {
    Session(SessionId: $SessionId) {
      SessionId
      CreateDateTime
      UpdateDateTime
      Note
      SessionDate
      RegularSetId
      BuyDayMinimum
      BuyWindow
      BuyWindowPreferred
      BuyWindowPreferredPlus
      Cost
      BuySells {
        BuySellId
        BuyerUserId
        SellerUserId
        SellerNote
        BuyerNote
        PaymentSent
        PaymentReceived
        CreateDateTime
        TeamAssignment
        Buyer {
          Id
          UserName
          Email
          FirstName
          LastName
          Rating
        }
        Seller {
          Id
          UserName
          Email
          FirstName
          LastName
          Rating
        }
      }
      ActivityLogs {
        ActivityLogId
        UserId
        CreateDateTime
        Activity
        User {
          Id
          UserName
          Email
          FirstName
          LastName
        }
      }
      RegularSet {
        RegularSetId
        Description
        DayOfWeek
        CreateDateTime
        Archived
        Regulars {
          RegularSetId
          UserId
          TeamAssignment
          PositionPreference
          User {
            Id
            UserName
            Email
            FirstName
            LastName
            Active
            Preferred
            PreferredPlus
            NotificationPreference
            PositionPreference
            Shoots
            EmergencyName
            EmergencyPhone
            JerseyNumber
            PhotoUrl
            LockerRoom13
            Rating
            PaymentMethods {
              UserPaymentMethodId
              MethodType
              Identifier
              PreferenceOrder
              IsActive
            }
          }
        }
      }
      CurrentRosters {
        SessionRosterId
        UserId
        Email
        FirstName
        LastName
        TeamAssignment
        IsPlaying
        IsRegular
        PlayerStatus
        Preferred
        PreferredPlus
        LastBuySellId
        Position
        CurrentPosition
        JoinedDateTime
        Rating
        PhotoUrl
      }
      BuyingQueues {
        BuySellId
        SessionId
        BuyerUserId
        SellerUserId
        BuyerName
        SellerName
        TeamAssignment
        TransactionStatus
        QueueStatus
        PaymentSent
        PaymentReceived
        BuyerNote
        SellerNote
        Buyer {
          Id
          UserName
          Email
          FirstName
          LastName
          Active
          Preferred
          PreferredPlus
          NotificationPreference
          PositionPreference
          Shoots
          EmergencyName
          EmergencyPhone
          JerseyNumber
          LockerRoom13
          PhotoUrl
          DateCreated
          Roles
          Rating
          PaymentMethods {
            UserPaymentMethodId
            MethodType
            Identifier
            PreferenceOrder
            IsActive
          }
        }
        Seller {
          Id
          UserName
          Email
          FirstName
          LastName
          Active
          Preferred
          PreferredPlus
          NotificationPreference
          PositionPreference
          Shoots
          EmergencyName
          EmergencyPhone
          JerseyNumber
          LockerRoom13
          PhotoUrl
          DateCreated
          Roles
          Rating
          PaymentMethods {
            UserPaymentMethodId
            MethodType
            Identifier
            PreferenceOrder
            IsActive
          }
        }
      }
    }
  }
`;

export const GET_LOCKERROOM13 = gql`
  query LockerRoom13 {
    LockerRoom13 {
      SessionId
      SessionDate
      LockerRoom13Players {
        Id
        UserName
        Email
        FirstName
        LastName
        Active
        Preferred
        PreferredPlus
        LockerRoom13
        PlayerStatus
      }
    }
  }
`;

export const GET_REGULARSETS = gql`
  query RegularSets {
    RegularSets {
      RegularSetId
      Description
      DayOfWeek
      CreateDateTime
      Archived
      Regulars {
        RegularSetId
        UserId
        TeamAssignment
        PositionPreference
        User {
          Id
          UserName
          Email
          FirstName
          LastName
          Active
          Preferred
          PreferredPlus
          NotificationPreference
          PositionPreference
          Shoots
          EmergencyName
          EmergencyPhone
          JerseyNumber
          PhotoUrl
          LockerRoom13
          DateCreated
          Roles
          Rating
          PaymentMethods {
            UserPaymentMethodId
            MethodType
            Identifier
            PreferenceOrder
            IsActive
          }
        }
      }
    }
  }
`;

export const GET_USERSTATS = gql`
  query UserStats($UserId: String!) {
    UserStats(UserId: $UserId) {
      MemberSince
      CurrentYearGamesPlayed
      PriorYearGamesPlayed
      CurrentYearBoughtTotal
      PriorYearBoughtTotal
      LastBoughtSessionDate
      CurrentYearSoldTotal
      PriorYearSoldTotal
      LastSoldSessionDate
      MostPlayedPosition
      CurrentBuyRequests
      WednesdayRegular
      FridayRegular
      TwoYearsAgoSoldTotal
      TwoYearsAgoBoughtTotal
      TwoYearsAgoGamesPlayed
    }
  }
`;

export const SESSION_UPDATED = gql`
  subscription SessionUpdated($SessionId: Int!) {
    SessionUpdated(SessionId: $SessionId) {
      SessionId
      CreateDateTime
      UpdateDateTime
      Note
      SessionDate
      RegularSetId
      BuyDayMinimum
      BuyWindow
      BuyWindowPreferred
      BuyWindowPreferredPlus
      Cost
      BuySells {
        BuySellId
        BuyerUserId
        SellerUserId
        SellerNote
        BuyerNote
        PaymentSent
        PaymentReceived
        CreateDateTime
        TeamAssignment
        Buyer {
          Id
          UserName
          Email
          FirstName
          LastName
          Rating
        }
        Seller {
          Id
          UserName
          Email
          FirstName
          LastName
          Rating
        }
      }
      ActivityLogs {
        ActivityLogId
        UserId
        CreateDateTime
        Activity
        User {
          Id
          UserName
          Email
          FirstName
          LastName
        }
      }
      RegularSet {
        RegularSetId
        Description
        DayOfWeek
        CreateDateTime
        Archived
        Regulars {
          RegularSetId
          UserId
          TeamAssignment
          PositionPreference
          User {
            Id
            UserName
            Email
            FirstName
            LastName
            Active
            Preferred
            PreferredPlus
            NotificationPreference
            PositionPreference
            Shoots
            EmergencyName
            EmergencyPhone
            JerseyNumber
            PhotoUrl
            LockerRoom13
            Rating
            PaymentMethods {
              UserPaymentMethodId
              MethodType
              Identifier
              PreferenceOrder
              IsActive
            }
          }
        }
      }
      CurrentRosters {
        SessionRosterId
        UserId
        Email
        FirstName
        LastName
        TeamAssignment
        IsPlaying
        IsRegular
        PlayerStatus
        Preferred
        PreferredPlus
        LastBuySellId
        Position
        CurrentPosition
        JoinedDateTime
        Rating
        PhotoUrl
      }
      BuyingQueues {
        BuySellId
        SessionId
        BuyerUserId
        SellerUserId
        BuyerName
        SellerName
        TeamAssignment
        TransactionStatus
        QueueStatus
        PaymentSent
        PaymentReceived
        BuyerNote
        SellerNote
        Buyer {
          Id
          UserName
          Email
          FirstName
          LastName
          Active
          Preferred
          PreferredPlus
          NotificationPreference
          PositionPreference
          Shoots
          EmergencyName
          EmergencyPhone
          JerseyNumber
          LockerRoom13
          PhotoUrl
          DateCreated
          Roles
          Rating
          PaymentMethods {
            UserPaymentMethodId
            MethodType
            Identifier
            PreferenceOrder
            IsActive
          }
        }
        Seller {
          Id
          UserName
          Email
          FirstName
          LastName
          Active
          Preferred
          PreferredPlus
          NotificationPreference
          PositionPreference
          Shoots
          EmergencyName
          EmergencyPhone
          JerseyNumber
          LockerRoom13
          PhotoUrl
          DateCreated
          Roles
          Rating
          PaymentMethods {
            UserPaymentMethodId
            MethodType
            Identifier
            PreferenceOrder
            IsActive
          }
        }
      }
    }
  }
`;
