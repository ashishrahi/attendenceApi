export interface ShiftRequestBody {
  id?: number;
  shiftname: string;
  intime: string; // "HH:mm:ss" format expected
  outtime: string; // "HH:mm:ss" format expected
}