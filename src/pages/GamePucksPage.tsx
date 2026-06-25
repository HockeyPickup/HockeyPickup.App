import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTitle } from '@/layouts/TitleContext';
import { ActionIcon, Box, Container, Text, TextInput } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { JSX, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Flickr REST API does not send CORS headers; JSONP bypasses CORS by loading via script tag. */
function flickrJsonp<T>(baseUrl: string): Promise<T> {
  type FlickrJsonpCallback = (_: T) => void;

  const url = baseUrl.replace('nojsoncallback=1', '').replace(/&$/, '');
  const separator = url.includes('?') ? '&' : '?';
  const callbackName = `flickrJsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return new Promise<T>((resolve, reject) => {
    const script = document.createElement('script');
    (window as unknown as Record<string, FlickrJsonpCallback>)[callbackName] = (data: T): void => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      if (script.parentNode) document.body.removeChild(script);
      resolve(data);
    };
    script.src = `${url}${separator}jsoncallback=${callbackName}`;
    script.onerror = (): void => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      if (script.parentNode) document.body.removeChild(script);
      reject(new Error('Flickr JSONP request failed'));
    };
    document.body.appendChild(script);
  });
}

/**
 * Photo from flickr.photosets.getPhotos with extras=date_taken,owner_name,title,path_alias.
 * Note: the `extras` request param uses underscore names, but Flickr returns the fields
 * WITHOUT underscores (datetaken, ownername, pathalias). The owner NSID is only returned
 * at the photoset level, not per photo.
 */
interface FlickrPhotoInSet {
  id: string;
  farm: number;
  server: string;
  secret: string;
  title: string;
  datetaken: string;
  ownername: string;
  pathalias?: string;
}

export const GamePucksPage = (): JSX.Element => {
  const { setPageInfo } = useTitle();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '');
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState<FlickrPhotoInSet[]>([]);
  const [albumOwner, setAlbumOwner] = useState('');

  useEffect(() => {
    setPageInfo('Game Pucks', 'Hockey Pickup Game Pucks');
  }, [setPageInfo]);

  useEffect(() => {
    const apiKey = '80ce3a61ed9e788c8e4e31641582fc0a';
    const flickrAlbumId = '72177720312370541';
    const extras = 'date_taken,owner_name,title,path_alias';
    const flickrUrl = `https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${apiKey}&photoset_id=${flickrAlbumId}&extras=${extras}&format=json&nojsoncallback=1`;

    flickrJsonp<{ photoset?: { owner: string; photo: FlickrPhotoInSet[] } }>(flickrUrl)
      .then((data) => {
        if (!data.photoset?.photo) {
          console.error('Failed to fetch photos:', data);
          return;
        }
        const list = data.photoset.photo;
        list.sort((a, b) => new Date(b.datetaken).getTime() - new Date(a.datetaken).getTime());
        setPhotos(list);
        setAlbumOwner(data.photoset.owner);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
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

  const filteredPhotos = photos.filter((photo) =>
    photo.title.toLowerCase().includes(searchQuery.toLowerCase()),
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
          {filteredPhotos.map((photo) => {
            const ownerPath = photo.pathalias ?? albumOwner;
            return (
              <a
                key={photo.id}
                href={`https://www.flickr.com/photos/${ownerPath}/${photo.id}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <img
                  src={`https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`}
                  alt={photo.title}
                />
                <p>{photo.title}</p>
              </a>
            );
          })}
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
