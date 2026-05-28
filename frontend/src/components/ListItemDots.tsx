import { Typography } from '@mui/material';

type DetailItemProp = { title: string; value: string | number };

export const ListItemDots = ({ title, value }: DetailItemProp) => {
    return (
        <Typography
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
            }}
        >
            {title}
            <span
                style={{
                    display: 'inline-block',
                    height: '1px',
                    flex: 1,
                    borderBottom: '1px dotted',
                    margin: '0 5px 6px',
                }}
            ></span>{' '}
            {value}
        </Typography>
    );
};
