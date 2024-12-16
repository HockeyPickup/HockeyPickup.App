import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRatingsVisibility } from '@/components/RatingsToggle';
import { RegularDetailedResponse, RegularSetDetailedResponse } from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
import { useAuth } from '@/lib/auth';
import { getPositionString } from '@/lib/position';
import { GET_REGULARSETS } from '@/lib/queries';
import { Team, TEAM_LABELS } from '@/lib/team';
import { useQuery } from '@apollo/client';
import {
  ActionIcon,
  Container,
  CopyButton,
  Grid,
  Group,
  Image,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { JSX, useEffect, useState } from 'react';

export const RegularsPage = (): JSX.Element => {
  const { setTitle } = useTitle();
  const { canViewRatings } = useAuth();
  const { showRatings } = useRatingsVisibility();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const { loading, data } = useQuery<{ RegularSets: RegularSetDetailedResponse[] }>(
    GET_REGULARSETS,
  );

  useEffect(() => {
    setTitle('Regulars');
  }, [setTitle]);

  if (loading) return <LoadingSpinner />;

  const regularSetOptions =
    data?.RegularSets?.map((s) => ({
      value: s.RegularSetId.toString(),
      label: s.Description ?? '',
    })) ?? [];

  const selectedPresetData = data?.RegularSets?.find(
    (set) => set.RegularSetId.toString() === selectedPreset,
  );

  const getTeamRegulars = (teamId: Team.Light | Team.Dark): RegularDetailedResponse[] => {
    return (
      selectedPresetData?.Regulars?.filter((regular) => regular.TeamAssignment === teamId).sort(
        (a, b) => {
          // Sort by position (Defense first)
          if (a.PositionPreference !== b.PositionPreference) {
            return b.PositionPreference - a.PositionPreference; // Defense (2) before Forward (1)
          }
          // Then by first name
          return (a.User?.FirstName ?? '').localeCompare(b.User?.FirstName ?? '');
        },
      ) ?? []
    );
  };

  const getTeamEmails = (teamId: Team.Light | Team.Dark): string[] => {
    return getTeamRegulars(teamId)
      .map((regular) => regular.User?.Email)
      .filter(Boolean) as string[];
  };

  const getAllEmails = (): string => {
    const lightEmails = getTeamEmails(Team.Light);
    const darkEmails = getTeamEmails(Team.Dark);
    return [...lightEmails, ...darkEmails].sort((a, b) => a.localeCompare(b)).join('\n');
  };

  const TeamSection = ({ teamId }: { teamId: Team.Light | Team.Dark }): JSX.Element => {
    const teamRegulars = getTeamRegulars(teamId);

    if (teamRegulars.length === 0) return <></>;

    const calculateTeamRatings = (): { total: string; average: string } => {
      const playersWithRatings = teamRegulars.filter(
        (regular) => regular.User?.Rating !== undefined && regular.User.Rating !== null,
      );
      const total = playersWithRatings.reduce(
        (sum, regular) => sum + (regular.User?.Rating ?? 0),
        0,
      );
      const avg = playersWithRatings.length ? total / playersWithRatings.length : 0;
      return { total: total.toFixed(1), average: avg.toFixed(2) };
    };

    const ratings = calculateTeamRatings();

    return (
      <Stack>
        <Stack align='center' gap='xs'>
          <Image
            src={teamId === Team.Light ? '/static/Rockets_Logo.jpg' : '/static/Beauties_Logo.jpg'}
            alt={teamId === Team.Light ? 'Rockets Logo' : 'Beauties Logo'}
            w={125}
            h={125}
            fit='contain'
            radius='md'
          />
          <Title order={4}>{TEAM_LABELS[teamId]}</Title>
        </Stack>
        {teamRegulars.map((regular) => (
          <Text key={regular.UserId}>
            {regular.User?.FirstName} {regular.User?.LastName},{' '}
            {getPositionString(regular.PositionPreference)}
            {canViewRatings() &&
              showRatings &&
              regular.User?.Rating !== undefined &&
              regular.User.Rating !== null &&
              `, ${regular.User.Rating.toFixed(1)}`}
          </Text>
        ))}
        {canViewRatings() && showRatings && (
          <Text size='lg' fw={700} mt='xs'>
            Total: {ratings.total}, Average: {ratings.average}
          </Text>
        )}
      </Stack>
    );
  };

  return (
    <Container size='sm' px='lg'>
      <Paper withBorder shadow='md' p={30} radius='md'>
        <Title order={2} mb='xl'>
          Regular Rosters
        </Title>

        <Stack>
          <Select
            label='Select Regular Set'
            placeholder='Choose a regular set'
            data={regularSetOptions}
            value={selectedPreset}
            onChange={setSelectedPreset}
          />

          {selectedPreset && (
            <Stack mt='xl'>
              <Grid>
                <Grid.Col span={6}>
                  <TeamSection teamId={1} />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TeamSection teamId={2} />
                </Grid.Col>
              </Grid>

              <Stack mt='xl'>
                <Group align='center'>
                  <Text size='sm'>Emails:</Text>
                  <CopyButton value={getAllEmails()}>
                    {({ copied, copy }) => (
                      <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    )}
                  </CopyButton>
                </Group>
                <Text size='xs' c='dimmed' style={{ whiteSpace: 'pre-line' }}>
                  {getAllEmails()}
                </Text>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};
