export enum ErrorCodes {

    // User, Auth and OTP related errors.
    USER_NOT_FOUND = 1001,
    PASSWORD_INCORRECT = 1002,
    EMAIL_ALREADY_IN_USE = 1003,
    PASSWORD_NOT_STRONG_ENOUGH = 1004,
    USER_NOT_LEVEL_1 = 1005,
    USER_NOT_LEVEL_2 = 1006,
    OLD_PASSWORD_INCORRECT = 1007,
    NEW_PASSWORD_NOT_STRONG_ENOUGH = 1008,
    OTP_ALREADY_REQUESTED = 1009,
    OTP_NOT_FOUND = 1010,
    OTP_EXPIRED = 1011,
    OTP_INCORRECT = 1012,
    LOGIN_ATTEMPTS_EXCEEDED = 1013,
    USER_STATUS_FAILED = 1014,
    FAILED_CHANGE_PASSWORD = 1100,
    FAILED_CHANGE_OTP_PASSWORD = 1101,
    FAILED_UPDATE_USER_INFO = 1102,
    FAILED_UPDATE_TO_LEVEL_1 = 1103,
    FAILED_REQUEST_TO_LEVEL_2 = 1104,
    FAILED_TO_LOGIN = 1105,
    FAILED_TO_SEND_OTP = 1106,
    FAILED_TO_RESEND_OTP = 1107,
    FAILED_TO_CREATE_USER = 1108,
    FAILED_TO_GET_USER_INFO = 1109,
    FAILED_TO_GET_USER_PUBLIC_INFO = 1110,
    FAILED_TO_LOGOUT = 1111,
    FAILED_TO_GET_REFRESH_TOKENS = 1112,

    // Vehicle related errors.
    INVALID_VEHICLE_TYPE = 2001,
    INVALID_VEHICLE_BRAND = 2002,
    INVALID_VEHICLE_MODEL = 2003,
    INVALID_VEHICLE_YEAR = 2004,
    INVALID_VEHICLE_COLOR = 2005,
    INVALID_TIME_FORMAT = 2006,
    VEHICLE_NOT_FOUND = 2007,
    VEHICLE_NOT_OWNER = 2008,
    VEHICLE_NOT_APPROVED = 2009,
    VEHICLE_NOT_REJECTED = 2010,
    VEHICLE_ALREADY_RATED = 2011,
    VEHICLE_ALREADY_HIDDEN = 2012,
    VEHICLE_NOT_HIDDEN = 2013,
    VEHICLE_NOT_RATED = 2014,
    INVALID_RATING = 2015,
    FAILED_TO_UPLOAD_VEHICLE = 2101,
    FAILED_TO_GET_VEHICLE_BY_ID = 2102,
    FAILED_TO_GET_MOST_VIEWED_VEHICLES = 2103,
    FAILED_TO_GET_MOST_VIEWED_VEHICLES_30D = 2104,
    FAILED_TO_GET_MOST_RATED_VEHICLES = 2105,
    FAILED_TO_GET_VEHICLES_BY_VEHICLE_TYPE = 2106,
    FAILED_TO_UPDATE_VEHICLE = 2107,
    FAILED_TO_GET_VEHICLES_BY_ACCOUNT_OWNER = 2108,
    FAILED_TO_CREATE_VEHICLE_RATING = 2109,
    FAILED_TO_GET_RECENT_VEHICLES = 2110,
    FAILED_TO_DELETE_VEHICLE = 2111,
    FAILED_TO_GET_RANDOM_VEHICLES = 2112,
    FAILED_TO_HIDE_VEHICLE = 2113,
    FAILED_TO_UNHIDE_VEHICLE = 2114,

    // Validation DTO related errors.
    DTO_VALIDATION_ERROR = 3001,

    // JWT related errors.
    TOKEN_NOT_PROVIDED_OR_EXPIRED = 3201,
    REFRESH_TOKEN_NOT_PROVIDED = 3202,
    INCORRECT_REFRESH_TOKEN = 3203,
    FAILED_TO_VERIFY_TOKEN = 3301,
    FAILED_TO_VERIFY_REFRESH_TOKEN  = 3302,
    FAILED_TO_RENEW_ACCESS_TOKEN = 3303,

    // Rental related errors.
    VEHICLE_NOT_AVAILABLE = 4001,
    OWNER_CANT_RENT_THEIR_OWN_VEHICLE = 4002,
    INVALID_RENTAL_STATUS = 4003,
    RENTAL_ALREADY_MADE_DECISION = 4004,
    USER_NOT_VEHICLE_OWNER_OF_RENTAL = 4005,
    USER_NOT_RENTER = 4006,
    RENTAL_NOT_IN_CORRECT_STATUS = 4007,
    USER_NOT_RENTER_OR_OWNER_OF_RENTAL = 4008,
    CONTRACT_NOT_FOUND = 4009,
    CONTRACT_NOT_IN_CORRECT_STATUS = 4010,
    RENTAL_NOT_REMAINING_PAYMENT_PENDING = 4011,
    INVALID_DATE_RANGE = 4012,
    FAILED_TO_CHECK_VEHICLE_AVALIABILITY = 4101,
    FAILED_TO_CREATE_RENTAL_CONFIRMATION = 4102,
    FAILED_TO_CREATE_RENTAL = 4103,
    FAILED_TO_GET_ALL_RENTER_RENTALS = 4104,
    FAILED_TO_GET_CURRENT_STATUS_RENTER_RENTAL = 4105,
    FAILED_TO_GET_RENTAL_STATUS = 4106,
    FAILED_TO_GET_ALL_RENTAL_OF_A_VEHICLE = 4107,
    FAILED_TO_GET_ALL_CURRENT_STATUS_RENTAL_OF_A_VEHICLE = 4108,
    FAILED_TO_MAKE_OWNER_DECISION = 4109,
    FAILED_TO_GET_PREPARED_CONTRACT = 4110,
    FAILED_TO_GET_ALL_CONTRACTS_FROM_RENTAL_ID = 4111,
    FAILED_TO_GET_CONTRACT_BY_ID = 4112,
    FAILED_TO_CREATE_CONTRACT = 4113,
    FAILED_TO_RENTER_SIGN_CONTRACT = 4114,
    FAILED_TO_VEHICLE_OWNER_SIGN_CONTRACT = 4115,
    FAILED_TO_REMAINING_PAYMENT_PAYMENT = 4116,
    FAILED_TO_CONFIRM_RENTER_RECEIVED_VEHICLE = 4117,
    FAILED_TO_CONFIRM_RENTER_RETURNED_VEHICLE = 4118,

    // Chat related errors.
    CHAT_SESSION_ALREADY_EXISTS = 5001,
    CHAT_SESSION_NOT_FOUND = 5002,
    FAILED_TO_STORE_MESSAGE = 5101,
    FAILED_TO_GET_MESSAGES = 5102,
    FAILED_TO_GET_CHAT_SESSIONS = 5103,
    FAILED_TO_CREATE_CHAT_SESSION = 5104,

    // Administrator related errors.
    ADMIN_ACCESS_ONLY = 8001,
    USER_ALREADY_MADE_A_DECISION = 8002,
    VEHICLE_ALREADY_MADE_A_DECISION = 8003,
    RENTAL_NOT_FOUND = 8004,
    RENTAL_CANCELLED = 8005,
    RENTAL_NOT_DEPOSIT_PENDING = 8006,
    FAILED_TO_GET_REQUESTED_LEVEL_2_USERS = 8101,
    FAILED_TO_DECISION_REQUESTED_LEVEL_2_USER = 8102,
    FAILED_TO_GET_REQUESTED_VEHICLES = 8103,
    FAILED_TO_DECISION_REQUESTED_VEHICLE = 8104,
    FAILED_TO_GET_A_RENTAL_RECORD = 8105,
    FAILED_TO_DEPOSIT_PAYMENT = 8106,

    // Unknown error.
    UNKNOWN_ERROR = 9001,
}