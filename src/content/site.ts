export type ContactChannel = 'email' | 'linkedin' | 'github'

interface Site {
  readonly name: string
  readonly givenName: string
  readonly familyName: string
  /** An empty value hides that row; if all three are empty the contact section is hidden. */
  readonly contact: Readonly<Record<ContactChannel, string>>
  /** URL of this site's source. Linked from the footer when set. */
  readonly repository: string
}

/** Facts that are the same in every language. */
export const site: Site = {
  name: 'Tobias Sjösten',
  givenName: 'Tobias',
  familyName: 'Sjösten',

  contact: {
    // An address, e.g. 'name@example.com'
    email: 'dev.tobiassjosten@gmail.com',
    // A full URL, e.g. 'https://www.linkedin.com/in/…'
    linkedin: '',
    // A username only
    github: '',
  },

  repository: 'https://github.com/tobieplz/tobieplz.github.io',
}
