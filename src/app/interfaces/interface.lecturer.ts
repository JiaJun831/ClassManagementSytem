export interface User {
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
}

export interface userlist {
  userlist: Array<User>;
}
