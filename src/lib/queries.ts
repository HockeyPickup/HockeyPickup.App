import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query UsersEx {
    UsersEx {
      Id
      UserName
      Email
      PayPalEmail
      FirstName
      LastName
      Active
      Preferred
      PreferredPlus
      NotificationPreference
      VenmoAccount
      MobileLast4
      EmergencyName
      EmergencyPhone
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
            PayPalEmail
            FirstName
            LastName
            Active
            Preferred
            PreferredPlus
            NotificationPreference
            VenmoAccount
            MobileLast4
            EmergencyName
            EmergencyPhone
            LockerRoom13
            Rating
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
      }
      BuyingQueues {
        BuySellId
        SessionId
        BuyerName
        SellerName
        TeamAssignment
        TransactionStatus
        QueueStatus
        PaymentSent
        PaymentReceived
        BuyerNote
        SellerNote
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
          PayPalEmail
          FirstName
          LastName
          Active
          Preferred
          PreferredPlus
          NotificationPreference
          VenmoAccount
          MobileLast4
          EmergencyName
          EmergencyPhone
          LockerRoom13
          DateCreated
          Roles
          Rating
        }
      }
    }
  }
`;
