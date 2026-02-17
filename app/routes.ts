import { route, index, type RouteConfig } from "@react-router/dev/routes";

export default [
  // Home
  index("routes/home.tsx"),
  route("coverage-calculator", "routes/coverage-calculator.tsx"),
  route("paint-coverage-calculator", "routes/paint-coverage-calculator.tsx"),
  route("mulch-coverage-calculator", "routes/mulch-coverage-calculator.tsx"),
  route("gravel-coverage-calculator", "routes/gravel-coverage-calculator.tsx"),
  route(
    "topsoil-coverage-calculator",
    "routes/topsoil-coverage-calculator.tsx",
  ),
  route("compost-coverage-calculator", "routes/compost-coverage-calculator.tsx"),

  // Legal / misc
  route("terms-of-service", "routes/terms-of-service.tsx"),
  route("privacy-policy", "routes/privacy-policy.tsx"),
  route("cookies", "routes/cookies.tsx"),
  route("contact", "routes/contact.tsx"),
] satisfies RouteConfig;
