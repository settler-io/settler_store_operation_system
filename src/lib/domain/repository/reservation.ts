import { Reservation } from "../entity";

export interface IReservationRepository {
  find(id: Reservation["id"]): Promise<Reservation>;

  add(entity: Reservation): Promise<Reservation>;
}
