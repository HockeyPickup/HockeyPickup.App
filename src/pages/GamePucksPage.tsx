import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTitle } from '@/layouts/TitleContext';
import { ActionIcon, Box, Container, Text, TextInput } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { JSX, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FlickrPhoto {
  id: string;
  farm: number;
  server: string;
  secret: string;
}

interface PhotoInfo {
  owner: { username: string };
  title: { _content: string };
  dates: { taken: string };
}

export const GamePucksPage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '');
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState<
    Array<{
      photo: FlickrPhoto;
      photoInfo: PhotoInfo;
      createdDate: Date;
    }>
  >([]);

  useEffect(() => {
    setPageInfo('Game Pucks', 'Hockey Pickup Game Pucks');
  }, [setPageInfo]);

  useEffect(() => {
    const apiKey = '80ce3a61ed9e788c8e4e31641582fc0a';
    const flickrAlbumId = '72177720312370541';
    const flickrUrl = `https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${apiKey}&photoset_id=${flickrAlbumId}&format=json&nojsoncallback=1`;

    const photoPromises: Promise<{
      photo: FlickrPhoto;
      photoInfo: PhotoInfo;
      createdDate: Date;
    }>[] = [];

    fetch(flickrUrl)
      .then((response) => response.json())
      .then((data) => {
        // Add error handling
        if (!data.photoset?.photo) {
          console.error('Failed to fetch photos:', data);
          setIsLoading(false);
          return;
        }
        const photos = data.photoset.photo;

        photos.forEach((photo: FlickrPhoto) => {
          const flickrPhotoId = photo.id;
          const flickrPhotoInfoUrl = `https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=${apiKey}&photo_id=${flickrPhotoId}&format=json&nojsoncallback=1`;

          const photoPromise = fetch(flickrPhotoInfoUrl)
            .then((response) => response.json())
            .then((data) => {
              const photoInfo = data.photo;
              const createdDate = new Date(photoInfo.dates.taken);
              return { photo, photoInfo, createdDate };
            });

          photoPromises.push(photoPromise);
        });

        Promise.all(photoPromises).then((photoData) => {
          photoData.sort((a, b) => a.createdDate.getTime() - b.createdDate.getTime());
          photoData.reverse();
          setPhotos(photoData);
          setIsLoading(false);
        });
      });
  }, []);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const handleSearch = (value: string): void => {
    setSearchQuery(value);
    setSearchParams(value ? { search: value } : {});
  };

  const filteredPhotos = photos.filter((photoData) =>
    photoData.photoInfo.title._content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Container size='xl' mb='lg'>
      {isLoading && <LoadingSpinner />}
      <Box mb='md' ml='md' mr='md' mt='md'>
        <TextInput
          placeholder='Search...'
          value={searchQuery}
          onChange={(event) => handleSearch(event.currentTarget.value)}
          rightSection={
            searchQuery ? (
              <ActionIcon onClick={() => handleSearch('')} variant='subtle' color='gray' size='sm'>
                <IconX size={16} stroke={1.5} color='#868E96' />
              </ActionIcon>
            ) : null
          }
        />
        <Text size='sm' mt='xs' color='dimmed'>
          {filteredPhotos.length} {filteredPhotos.length === 1 ? 'Result' : 'Results'}
        </Text>
      </Box>
      <Box>
        <div
          id='flickrAlbum'
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            maxWidth: '1200px',
            margin: '20px auto',
          }}
        >
          {filteredPhotos.map(({ photo, photoInfo }) => (
            <a
              key={photo.id}
              href={`https://www.flickr.com/photos/${photoInfo.owner.username}/${photo.id}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <img
                src={`https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`}
                alt={photoInfo.title._content}
              />
              <p>{photoInfo.title._content}</p>
            </a>
          ))}
        </div>
        <style>
          {`
            #flickrAlbum a,
            #flickrAlbum a:link,
            #flickrAlbum a:visited,
            #flickrAlbum a:hover,
            #flickrAlbum a:active {
              flex: 0 0 auto;
              width: 100%;
              max-width: 600px;
              min-width: auto;
              text-decoration: none !important;
              color: inherit;
              transition: transform 0.2s ease-in-out;
              border-bottom: none !important;
              outline: none !important;
            }

            @media (min-width: 768px) {
              #flickrAlbum a,
              #flickrAlbum a:link,
              #flickrAlbum a:visited,
              #flickrAlbum a:hover,
              #flickrAlbum a:active {
                width: calc(33.33% - 10px);
                min-width: 300px;
              }
            }
            #flickrAlbum a:hover {
              transform: translateY(-2px);
            }
            #flickrAlbum img {
              width: 100%;
              height: auto;
              objectFit: cover;
              marginBottom: 2px;
              borderRadius: 4px;
            }
            #flickrAlbum p {
              margin: 0;
              fontSize: 12px;
              color: #666;
            }
          `}
        </style>
      </Box>
    </Container>
  );
};
