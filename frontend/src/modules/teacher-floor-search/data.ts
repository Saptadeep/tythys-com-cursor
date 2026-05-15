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
    teachers: ['Ms. Ritu Bammi'],
    room: 'Room 1, Block A',
    floor: 'Ground Floor',
  },
  {
    teachers: ['Ms. Neha Sejwal-LS'],
    room: 'Room 2, Block A',
    floor: 'Ground Floor',
  },
  {
    teachers: ['Mr. Deepesh Sharma'],
    room: 'Room 3, Block A',
    floor: 'Ground Floor',
  },
  {
    teachers: ['Ms. Indu Chauhan'],
    room: 'VA, Block A',
    floor: 'First Floor',
  },
  {
    teachers: ['Ms. Pratibha Bisen', 'Ms. Sonali Mitra'],
    room: 'VB, Block A',
    floor: 'First Floor',
  },
  {
    teachers: ['Ms. Mrinmayee Dey-ART', 'Ms. Shalini Tomar'],
    room: 'VC, Block A',
    floor: 'First Floor',
  },
  {
    teachers: ['Ms. Akanksha Rana-DANCE', 'Ms. Ayesha Khan - DIARY', 'Ms. Saumya Singh-MATH'],
    room: 'Next to Auditorium',
    floor: 'First Floor',
  },
  {
    teachers: ['Ms. Ritika Verma-BIO'],
    room: 'Next to Auditorium',
    floor: 'First Floor',
  },
  {
    teachers: [
      'Mr. Chetan Kumar',
      'Mr. Sunil Dubey',
      'Ms. Rimpamla Vashi',
      'Mr. Sandeep Rai-DANCE',
    ],
    room: 'Conference room',
    floor: 'First Floor',
  },
  {
    teachers: ['Dr. Unnati Gulaty', 'Ms. Radhika Pandey-GEO'],
    room: 'Yoga room',
    floor: 'Basement/First Floor',
  },
  {
    teachers: ['Ms. Monika Handa', 'Ms. Avneet Kaur Marwah'],
    room: 'Room 1, Block C',
    floor: 'Ground Floor',
  },
  {
    teachers: ['Ms. Parul Kapila'],
    room: 'IX A, Block C',
    floor: 'First Floor',
  },
  {
    teachers: ['Ms. Saumya Joshi-ELIT'],
    room: 'IX B, Block C',
    floor: 'First Floor',
  },
  {
    teachers: ['Ms. Mamta Goyal', 'Mr. Divy Bansal', 'Ms. Sarika Bajaj'],
    room: 'XB, Block C',
    floor: 'First Floor',
  },
  {
    teachers: ['Mr. Anup Singh Chauhan-PHY'],
    room: 'Tutorial Room',
    floor: 'First Floor',
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