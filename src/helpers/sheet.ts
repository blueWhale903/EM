type studentSchema = {
  name: string;
  studentId: string;
  faculty: string;
  eventId: string;
};
export function extractDataFromSheetRes(data: any, id: string) {
  let rows = data.table.rows;
  let participants: studentSchema[] = [];

  rows.forEach((row: any) => {
    const student = row.c;
    const name = student[0].v;
    const studentId = student[1].v;
    const faculty = student[2].v;
    const studentData = {
      name: name,
      studentId: studentId,
      faculty: faculty,
      eventId: id,
    };
    participants.push(studentData);
  });

  return participants;
}
