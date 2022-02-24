export interface Lecturer {
  id: number;
  FirstName: string;
  LastName: string;
  AddressLine1: string;
  AddressLine2: string;
  County: string;
  Country: string;
  EirCode: string;
  Mobile: string;
  DOB: Date;
  Email: string;
  ModuleID: number;
}

export interface LecturerList {
  userlist: Array<Lecturer>;
}
