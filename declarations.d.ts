// additional.d.ts
/// <reference types="next-images" />
/// <reference types="@types/linkify-react" />
/// <reference types="@testing-library/jest-dom" />

declare module 'testing-library__jest-dom';

type SearchParams = { [key: string]: string | string[] | undefined };
