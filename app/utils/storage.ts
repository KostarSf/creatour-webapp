import { redirect } from "@remix-run/node";
import { db } from "./db.server";

// export async function GetAllProducts(): Promise<Product[]> {
//   const tripListItems = await db.trip.findMany({
//     select: { id: true, name: true, short: true, image: true },
//   });
//   const trips = tripListItems.map((o) => ({ ...o, type: ProductType.trip }));

//   const tourListItems = await db.tour.findMany({
//     select: { id: true, name: true, short: true, image: true },
//   });
//   const tours = tourListItems.map((o) => ({ ...o, type: ProductType.tour }));

//   const questListItems = await db.quest.findMany({
//     select: { id: true, name: true, short: true, image: true },
//   });
//   const quests = questListItems.map((o) => ({
//     ...o,
//     type: ProductType.quest,
//   }));

//   const eventListItems = await db.event.findMany({
//     select: { id: true, name: true, short: true, image: true },
//   });
//   const events = eventListItems.map((o) => ({
//     ...o,
//     type: ProductType.event,
//   }));

//   return [...trips, ...tours, ...quests, ...events];
// }

// export async function GetProductsByCategory(
//   category: string
// ): Promise<Product[]> {
//   switch (category) {
//     case "trips":
//       const tripListItems = await db.trip.findMany({
//         select: { id: true, name: true, short: true, image: true },
//       });
//       return tripListItems.map((o) => ({ ...o, type: ProductType.trip }));
//     case "tours":
//       const tourListItems = await db.tour.findMany({
//         select: { id: true, name: true, short: true, image: true },
//       });
//       return tourListItems.map((o) => ({ ...o, type: ProductType.tour }));
//     case "quests":
//       const questListItems = await db.quest.findMany({
//         select: { id: true, name: true, short: true, image: true },
//       });
//       return questListItems.map((o) => ({
//         ...o,
//         type: ProductType.quest,
//       }));
//     case "events":
//       const eventListItems = await db.event.findMany({
//         select: { id: true, name: true, short: true, image: true },
//       });
//       return eventListItems.map((o) => ({
//         ...o,
//         type: ProductType.event,
//       }));
//     default:
//       console.log("Error - category " + category);
//       throw redirect("/products");
//   }
// }
