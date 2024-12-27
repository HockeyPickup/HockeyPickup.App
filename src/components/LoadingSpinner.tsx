import { LoadingOverlay, MantineLoaderComponent } from '@mantine/core';
import { forwardRef, JSX } from 'react';

interface LoaderProps {
  visible?: boolean;
  mini?: boolean;
  medium?: boolean;
}

export const LoadingSpinner: React.FC<LoaderProps> = ({
  visible = true,
  mini = false,
  medium = false,
}): React.JSX.Element => {
  if (mini || medium) {
    return <LogoSpinner mini={mini} medium={medium} />;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: '#1A1B1E',
      }}
    >
      <LoadingOverlay
        visible={visible}
        overlayProps={{ blur: 2 }}
        loaderProps={{ children: <LogoSpinner /> }}
      />
    </div>
  );
};

export const LoadingSpinnerLoader: MantineLoaderComponent = forwardRef(() => {
  return <LogoSpinner />;
});

interface LogoSpinnerProps {
  mini?: boolean;
  medium?: boolean;
}

export const LogoSpinner = ({ mini = false, medium = false }: LogoSpinnerProps): JSX.Element => {
  const size: string = mini ? '48' : medium ? '128' : '231';

  return (
    <svg width={size} height={size} viewBox='0 0 38 38' xmlns='http://www.w3.org/2000/svg'>
      <g fill='none' fillRule='evenodd'>
        <g transform='translate(1 1)' strokeWidth='2'>
          <image xlinkHref='/static/JB_Puck_Logo.png' x='0' y='0' width='36' height='36'>
            <animateTransform
              attributeName='transform'
              type='rotate'
              from='0 18 18'
              to='360 18 18'
              dur='2s'
              repeatCount='indefinite'
            />
          </image>
        </g>
      </g>
    </svg>
  );
};
