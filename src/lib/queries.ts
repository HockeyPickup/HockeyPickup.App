import { gql } from '@apollo/client';
import type { DocumentNode } from '@apollo/client';

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

/**
 * The dashboard's per-session selection.
 *
 * The `Sessions` list query resolves SessionBasicResponse, which has no CurrentRosters and no
 * BuySells, so roster membership has to come from `Session(SessionId:)`. Requesting it once per
 * session would mean N round-trips, so buildDashboardSessionsQuery aliases them into a single
 * document instead. Only these fields are selected — ActivityLogs, BuyingQueues, RegularSet and
 * LotteryEntrants stay off the wire, which is what keeps this cheap enough for a landing page.
 *
 * Keep in sync with DashboardSession in @/types/graphql.
 */
const DASHBOARD_SESSION_FIELDS = `
  SessionId
  SessionDate
  Note
  Cost
  BuyDayMinimum
  BuyWindow
  BuyWindowPreferred
  BuyWindowPreferredPlus
  CurrentRosters {
    UserId
    FirstName
    LastName
    TeamAssignment
    Position
    CurrentPosition
    IsPlaying
  }
  BuySells {
    BuySellId
    SessionId
    BuyerUserId
    SellerUserId
    PaymentSent
    PaymentReceived
    Price
    Buyer {
      Id
      FirstName
      LastName
    }
    Seller {
      Id
      FirstName
      LastName
    }
  }
`;

/** Alias for a session id. Deterministic, so results map straight back to their session. */
export const dashboardSessionAlias = (sessionId: number): string => `s${sessionId}`;

/**
 * A document with an empty selection set is invalid GraphQL, so callers with no session ids get
 * this placeholder and are expected to pass `skip: true` alongside it.
 */
export const EMPTY_DASHBOARD_SESSIONS = gql`
  query DashboardSessionsEmpty {
    __typename
  }
`;

export const buildDashboardSessionsQuery = (sessionIds: number[]): DocumentNode => {
  if (sessionIds.length === 0) return EMPTY_DASHBOARD_SESSIONS;

  const selections = sessionIds
    .map(
      (sessionId) =>
        `  ${dashboardSessionAlias(sessionId)}: Session(SessionId: ${sessionId}) {${DASHBOARD_SESSION_FIELDS}  }`,
    )
    .join('\n');

  return gql`
    query DashboardSessions {
${selections}
    }
  `;
};

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
      LotteryEnabled
      LotteryEntryWindowMinutes
      LotteryEntryOpenStandard
      LotteryEntryOpenPreferred
      LotteryEntryOpenPreferredPlus
      LotteryDrawStandard
      LotteryDrawPreferred
      LotteryDrawPreferredPlus
      Cost
      BuySells {
        BuySellId
        BuyerUserId
        SellerUserId
        BuyerNote
        SellerNote
        SellerNoteFlagged
        BuyerNoteFlagged
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
        FirstName
        LastName
        CreateDateTime
        Activity
      }
      LotteryEntrants {
        LotteryEntrantId
        UserId
        FirstName
        LastName
        PhotoUrl
        LotteryClass
        Status
        DrawOrder
        DrawDateTime
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
        BuyerNoteFlagged
        SellerNoteFlagged
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
      LotteryEnabled
      LotteryEntryWindowMinutes
      LotteryEntryOpenStandard
      LotteryEntryOpenPreferred
      LotteryEntryOpenPreferredPlus
      LotteryDrawStandard
      LotteryDrawPreferred
      LotteryDrawPreferredPlus
      Cost
      BuySells {
        BuySellId
        BuyerUserId
        SellerUserId
        BuyerNote
        SellerNote
        BuyerNoteFlagged
        SellerNoteFlagged
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
        FirstName
        LastName
        CreateDateTime
        Activity
      }
      LotteryEntrants {
        LotteryEntrantId
        UserId
        FirstName
        LastName
        PhotoUrl
        LotteryClass
        Status
        DrawOrder
        DrawDateTime
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
        BuyerNoteFlagged
        SellerNoteFlagged
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
