export interface User {
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
  CourseID: number;
}

export interface UserLIst {
  userlist: Array<User>;
}
