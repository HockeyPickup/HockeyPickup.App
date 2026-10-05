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
      Goalies {
        UserId
        FirstName
        LastName
        PhotoUrl
        IsPlaying
        JoinedDateTime
      }
    }
  }
`;

/**
 * The signed-in player's whole home page in one request.
 *
 * The Api resolves this from the token: every upcoming session (goalies included), roster and
 * buy/sell detail for the nearest few live ones, the viewer's unsettled transactions with
 * counterparty names, and their past goalie starts by year. Before this existed the page needed
 * the full session history and then a second round trip for detail, which is what made it slow.
 *
 * Keep the Sessions selection in sync with DashboardSession in @/types/graphql.
 */
export const GET_DASHBOARD = gql`
  query Dashboard {
    Dashboard {
      UpcomingSessions {
        SessionId
        CreateDateTime
        UpdateDateTime
        Note
        SessionDate
        RegularSetId
        BuyDayMinimum
        Cost
        Goalies {
          UserId
          FirstName
          LastName
          PhotoUrl
          IsPlaying
          JoinedDateTime
        }
      }
      Sessions {
        SessionId
        SessionDate
        Note
        Cost
        BuyDayMinimum
        BuyWindow
        BuyWindowPreferred
        BuyWindowPreferredPlus
        Goalies {
          UserId
          FirstName
          LastName
          PhotoUrl
          IsPlaying
          JoinedDateTime
        }
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
          ...DashboardBuySellFields
        }
        BuyingQueues {
          BuySellId
          BuyerUserId
          SellerUserId
          QueueStatus
        }
      }
      PendingPayments {
        ...DashboardBuySellFields
      }
      GoalieStartsByYear {
        Year
        Starts
      }
    }
  }

  fragment DashboardBuySellFields on DashboardBuySell {
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
      Goalies {
        UserId
        FirstName
        LastName
        PhotoUrl
        IsPlaying
        JoinedDateTime
      }
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
      Goalies {
        UserId
        FirstName
        LastName
        PhotoUrl
        IsPlaying
        JoinedDateTime
      }
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
