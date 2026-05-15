/**
 * Static seating data (from pasted CSV). Each row lists teachers sharing one room.
 */
export type SeatingRow = {
  teachers: string[]
  room: string
  floor: string
}

export const SEATING_ROWS: SeatingRow[] = [
  {
    teachers: ['Ms. Ritu Bammi', 'Mr. Zothan', 'Ms. Prabha Saraswat'],
    room: 'Room 1, Block A',
    floor: 'Ground Floor',
  },
  {
    teachers: ['Ms. Neha Sejwal', 'Ms. Meenakshi Chauhan', 'Ms. Mohita Sharma'],
    room: 'Room 2, Block A',
    floor: 'Ground Floor',
  },
  {
    teachers: ['Ms. Ananya Juneja', 'Ms. Khyati Sharma', 'Mr. Deepesh Sharma'],
    room: 'Room 3, Block A',
    floor: 'Ground Floor',
  },
  {
    teachers: ['Ms. Indu Chauhan', 'Ms. Dhriti Manktalia'],
    room: 'VA, Block A',
    floor: 'First Floor',
  },
  {
    teachers: ['Ms. Pratibha Bisen', 'Ms. Sonali Mitra'],
    room: 'VB, Block A',
    floor: 'First Floor',
  },
  {
    teachers: ['Ms. Mrinmayee Dey', 'Ms. Shalini Tomar', 'Ms. Shresthama Singh'],
    room: 'VC, Block A',
    floor: 'First Floor',
  },
  {
    teachers: ['Ms. Akanksha Rana', 'Ms. Ayesha Khan', 'Ms. Saumya Singh'],
    room: 'Next to Auditorium',
    floor: 'Ground Floor',
  },
  {
    teachers: ['Ms. Jaspreet Kaur', 'Ms. Ritika Verma'],
    room: 'Next to Auditorium',
    floor: 'Ground Floor',
  },
  {
    teachers: [
      'Mr. Chetan Kumar',
      'Mr. Sunil Dubey',
      'Ms. Rimpamla Vashi',
      'Mr. Sandeep Rai',
    ],
    room: 'Conference room',
    floor: 'Ground Floor',
  },
  {
    teachers: ['Dr. Unnati Gulaty', 'Ms. Gayatri Khurana', 'Ms. Radhika Pandey'],
    room: 'Yoga room',
    floor: 'Ground Floor',
  },
  {
    teachers: ['Ms. Monika Handa', 'Ms. Ravina Ameta', 'Ms. Avneet Kaur Marwah'],
    room: 'Room 1, Block C',
    floor: 'Ground Floor',
  },
  {
    teachers: ['Ms. Sakshi Chopra', 'Ms. Swati Jain'],
    room: 'Room 2, Block C',
    floor: 'Ground Floor',
  },
  {
    teachers: ['Ms. Priyanka Sen', 'Ms. Parul Kapila', 'Ms. Chetna Joshi'],
    room: 'IX A, Block C',
    floor: 'First Floor',
  },
  {
    teachers: ['Mr. Manish Dwivedi', 'Dr. Roli Bhatnagar', 'Ms. Saumya Joshi'],
    room: 'IX B, Block C',
    floor: 'First Floor',
  },
  {
    teachers: ['Dr. B.K. Tejeswi', 'Dr. Gayatri Tripathy', 'Ms. Seema Srivastava'],
    room: 'XA, Block C',
    floor: 'First Floor',
  },
  {
    teachers: ['Ms. Mamta Goyal', 'Mr. Divy Bansal', 'Ms. Sarika Bajaj'],
    room: 'XB, Block C',
    floor: 'First Floor',
  },
  {
    teachers: ['Mr. Anup Singh Chauhan', 'Ms. Shweta Rawat'],
    room: 'Tutorial Room',
    floor: 'Ground Floor',
  },
  {
    teachers: ['Ms. Deepti Chandiramani'],
    room: "Head Mistress' Rooms, Block A",
    floor: 'First Floor',
  },
  {
    teachers: ['Ms. Sonia Menon'],
    room: "Head Mistress' Rooms, Block C",
    floor: 'Ground Floor',
  },
  {
    teachers: ['Ms. Sakshi Gautam Mishra'],
    room: "Principal's Office, Block A",
    floor: 'Ground Floor',
  },
]
