import { z } from "zod";
import { zTavilyTraversal } from "../../../schema/traversal.ts";

/** POST /map body - the shared traversal fields, nothing else. */
export const zTavilyMapBody = z.looseObject(zTavilyTraversal);
