export interface Student {
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

export interface StudentList {
  userlist: Array<Student>;
}
