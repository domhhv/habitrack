import { act, render, waitFor, fireEvent } from '@testing-library/react';
import { Link, Outlet, useFetcher, createRoutesStub } from 'react-router';
import { it, expect, describe } from 'vitest';

import GlobalProgressBar from './GlobalProgressBar';

const createDeferred = () => {
  let resolve = () => {};

  const promise = new Promise<null>((done) => {
    resolve = () => {
      done(null);
    };
  });

  return { promise, resolve };
};

const renderWithRoutes = (pending: Promise<null>) => {
  const Home = () => {
    const fetcher = useFetcher();

    return (
      <>
        <Link to="/slow">Go</Link>
        <button
          type="button"
          onClick={() => {
            void fetcher.submit({}, { action: '/save', method: 'post' });
          }}
        >
          Save
        </button>
      </>
    );
  };

  const Stub = createRoutesStub([
    {
      Component: () => {
        return (
          <>
            <GlobalProgressBar />
            <Outlet />
          </>
        );
      },
      children: [
        { Component: Home, path: '/' },
        {
          path: '/slow',
          Component: () => {
            return <p>Slow page</p>;
          },
          loader: () => {
            return pending;
          },
        },
        {
          path: '/save',
          action: () => {
            return pending;
          },
        },
      ],
    },
  ]);

  return render(<Stub initialEntries={['/']} />);
};

const getBar = (container: HTMLElement) => {
  return container.querySelector('[role="progressbar"]');
};

describe(GlobalProgressBar.name, () => {
  it('stays hidden while idle', async () => {
    const { container, findByText } = renderWithRoutes(
      createDeferred().promise
    );

    await findByText('Go');

    expect(getBar(container)).toHaveAttribute('data-visible', 'false');
  });

  it('shows after a short delay during a navigation and hides once it ends', async () => {
    const deferred = createDeferred();
    const { container, findByText } = renderWithRoutes(deferred.promise);

    fireEvent.click(await findByText('Go'));

    expect(getBar(container)).toHaveAttribute('data-visible', 'false');
    await waitFor(() => {
      expect(getBar(container)).toHaveAttribute('data-visible', 'true');
    });

    act(() => {
      deferred.resolve();
    });

    await findByText('Slow page');
    expect(getBar(container)).toHaveAttribute('data-visible', 'false');
  });

  it('shows while a fetcher submission is pending', async () => {
    const deferred = createDeferred();
    const { container, findByText } = renderWithRoutes(deferred.promise);

    fireEvent.click(await findByText('Save'));

    await waitFor(() => {
      expect(getBar(container)).toHaveAttribute('data-visible', 'true');
    });

    act(() => {
      deferred.resolve();
    });

    await waitFor(() => {
      expect(getBar(container)).toHaveAttribute('data-visible', 'false');
    });
  });
});
