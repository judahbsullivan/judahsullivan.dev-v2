import { createDirectus } from "@directus/sdk";
import { rest } from "@directus/sdk";
import { CustomDirectusTypes } from "./types";
import { api } from "./env";

const url = api.apiUrl;
const client = createDirectus<CustomDirectusTypes>(url).with(rest());

export { client };
