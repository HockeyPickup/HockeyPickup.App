import { LoadingSpinner } from '@/components/LoadingSpinner';
import { RegularDetailedResponse, RegularSetDetailedResponse } from '@/HockeyPickup.Api';
import { useTitle } from '@/layouts/TitleContext';
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
      selectedPresetData?.Regulars?.filter((regular) => regular.TeamAssignment === teamId) ?? []
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
    return [...lightEmails, ...darkEmails].join('\n');
  };

  const TeamSection = ({ teamId }: { teamId: Team.Light | Team.Dark }): JSX.Element => {
    const teamRegulars = getTeamRegulars(teamId);

    if (teamRegulars.length === 0) return <></>;

    return (
      <Stack>
        <Title order={3}>{TEAM_LABELS[teamId]}</Title>
        {teamRegulars.map((regular) => (
          <Text key={regular.UserId}>
            {regular.User?.FirstName} {regular.User?.LastName},{' '}
            {getPositionString(regular.PositionPreference)}
          </Text>
        ))}
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
