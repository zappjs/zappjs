import { IIcon } from '@/interfaces/IIcon';
import { FC } from 'react';

export const CSharpIcon: FC<IIcon> = ({ color = 'white', size = 16 }) => (
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
      d="M117.2,199.7c-13.5,6.6-28.5,9.7-43.5,9.2c-20.1,0.9-39.6-7-53.5-21.5c-13.8-15.5-21-35.8-20.1-56.5
	c-1-22.5,7.2-44.4,22.6-60.7c15.1-15.4,36-23.8,57.6-23.1c12.6-0.5,25.2,1.6,36.9,6.2v19.6c-11.4-6.3-24.3-9.6-37.3-9.4
	c-16.4-0.5-32.3,6-43.5,18c-11.6,13.3-17.7,30.5-16.8,48.2c-0.9,16.7,4.8,33,15.7,45.6c10.6,11.4,25.6,17.6,41.2,17
	c14.3,0.4,28.5-3.3,40.8-10.5L117.2,199.7z M256,93.5l-2.5,11.6h-28.6l-6.8,32.8h30.7l-2.9,11.6h-30.1l-9.6,43.5h-13.7l9.4-43.5
	h-27.4l-9.2,43.5h-13.4l9.2-43.5h-28.8l2.2-11.6h29l6.7-32.8h-30.3l2.3-11.6h30.3l9.2-43.9h13.9l-9.2,43.9h27.5l9.4-43.9h13.4
	l-9.2,43.9L256,93.5z M211.4,105h-27.6l-7.1,32.8h27.7L211.4,105z"
    />
  </svg>
);
