import { FC } from 'react';

export const JsIcon: FC<{ color?: string; size?: number }> = ({ color = '#FFDF00', size = 16 }) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 256 256"
      enableBackground="new 0 0 256 256"
      xmlSpace="preserve"
      width={size}
      height={size}
    >
      <path
        fill={color}
        d="M158.7,164.3c7.8,12.8,18,22.2,36,22.2c15.1,0,24.8-7.6,24.8-18c0-12.5-9.9-16.9-26.6-24.2l-9.1-3.9
	c-26.3-11.2-43.8-25.3-43.8-55c0-27.4,20.9-48.2,53.5-48.2c23.2,0,39.9,8.1,51.9,29.2l-28.4,18.3c-6.3-11.2-13-15.6-23.5-15.6
	c-10.7,0-17.5,6.8-17.5,15.6c0,11,6.8,15.4,22.4,22.2l9.1,3.9c31,13.3,48.5,26.9,48.5,57.3c0,32.9-25.8,50.9-60.5,50.9
	c-33.9,0-55.8-16.2-66.5-37.3L158.7,164.3z M29.7,167.5c5.7,10.2,11,18.8,23.5,18.8c12,0,19.6-4.7,19.6-22.9V39.2h36.5v124.6
	c0,37.8-22.2,55-54.5,55c-29.2,0-46.2-15.1-54.8-33.3L29.7,167.5z"
      />
    </svg>
  );
};
