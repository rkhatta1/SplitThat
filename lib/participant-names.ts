export interface NamedParticipant {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface ParticipantNameMaps {
  displayNameById: Record<string, string>;
  commentNameById: Record<string, string>;
}

function cleanNamePart(value?: string | null): string {
  return value?.trim() || "";
}

function buildDisplayName(
  firstName: string,
  lastName: string,
  hasDuplicateFirstName: boolean
): string {
  if (!hasDuplicateFirstName) {
    return firstName;
  }

  const lastInitial = lastName.charAt(0).toUpperCase();
  return lastInitial ? `${firstName} ${lastInitial}.` : firstName;
}

function buildCommentName(
  firstName: string,
  lastName: string,
  hasDuplicateFirstName: boolean
): string {
  if (!hasDuplicateFirstName) {
    return firstName;
  }

  return lastName ? `${firstName} ${lastName}` : firstName;
}

export function buildParticipantNameMaps(
  participants: NamedParticipant[]
): ParticipantNameMaps {
  const uniqueParticipants: NamedParticipant[] = [];
  const seenIds = new Set<string>();

  participants.forEach((participant) => {
    if (seenIds.has(participant.id)) {
      return;
    }
    seenIds.add(participant.id);
    uniqueParticipants.push(participant);
  });

  const firstNameCounts: Record<string, number> = {};

  uniqueParticipants.forEach((participant) => {
    const firstName = cleanNamePart(participant.firstName) || "Unknown";
    const key = firstName.toLowerCase();
    firstNameCounts[key] = (firstNameCounts[key] || 0) + 1;
  });

  const displayNameById: Record<string, string> = {};
  const commentNameById: Record<string, string> = {};

  uniqueParticipants.forEach((participant) => {
    const firstName = cleanNamePart(participant.firstName) || "Unknown";
    const lastName = cleanNamePart(participant.lastName);
    const hasDuplicateFirstName = firstNameCounts[firstName.toLowerCase()] > 1;

    displayNameById[participant.id] = buildDisplayName(
      firstName,
      lastName,
      hasDuplicateFirstName
    );
    commentNameById[participant.id] = buildCommentName(
      firstName,
      lastName,
      hasDuplicateFirstName
    );
  });

  return { displayNameById, commentNameById };
}
