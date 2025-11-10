export const StudGameType = {
	StudHi: "STUD_HI",
	Razz: "RAZZ",
	Stud8: "STUD_8",
} as const;

export type StudGameType = (typeof StudGameType)[keyof typeof StudGameType];
