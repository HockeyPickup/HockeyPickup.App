import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query Users {
    Users {
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
        }
        Seller {
          Id
          UserName
          Email
          FirstName
          LastName
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
          }
        }
      }
    }
  }
`;
