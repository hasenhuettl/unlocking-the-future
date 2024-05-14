// Base configuration
let config = {
	"port": 3000,
	"origin": "https://authenticate.hasenhuettl.cc",
	"rpId": "authenticate.hasenhuettl.cc",
	"rpName": "Webauthn Skeleton",
	"mode": "production",
	"baseUrl": undefined, // Uses origin as default
	"cookieMaxAge": 50, // 1 minute
	"challengeTimeoutMs": 90 * 1000, // 90 seconds
	"loginTokenExpireSeconds": 23
};

// Environment overrides (normally no need to touch this)
config.port = process.env.PORT || config.port;
config.origin = process.env.WAS_ORIGIN || config.origin;
config.rpId = process.env.WAS_RPID || config.rpId;
config.rpName = process.env.WAS_RPNAME || config.rpName;
config.mode = process.env.WAS_MODE || config.mode;
config.baseUrl = process.env.WAS_BASE_URL || config.baseUrl || config.origin;

// Forced cleanup (normally no need to touch this)
// - Remove trailing slash from origin and baseUrl
config.baseUrl = config.baseUrl.substr(-1) === "/" ? config.baseUrl.slice(0,-1) : config.baseUrl;
config.origin = config.origin.substr(-1) === "/" ? config.origin.slice(0,-1) : config.origin;

// Export config
module.exports = config;
