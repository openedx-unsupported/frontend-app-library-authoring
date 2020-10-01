import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { LIBRARY_TYPES, unpackLibraryKey } from '../../common';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');

export async function getOrgList() {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const response = await client.get(`${baseUrl}/organizations`);

  return response.data;
}

export async function getLibraryList(params) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;

  const pageSize = 2;
  const currentPage = params.page ? params.page : 1;

  const paginationParams = `?pagination=true&page_size=${pageSize}&page=${currentPage}`;

  /* Fetch modulestore and blockstore libraries simultaneously, if required. */
  let v1Request;
  let v2Request;
  if (params.type === LIBRARY_TYPES.LEGACY) {
    v1Request = client.get(`${baseUrl}/library/${paginationParams}`, { params });
  } else {
    v2Request = client.get(`${baseUrl}/api/libraries/v2/${paginationParams}`, { params });
  }
  const promises = [v1Request, v2Request].filter(x => !!x);
  await Promise.all(promises);
  let libraries = []
  let count = 0;

  /* Normalize modulestore properties to conform to the v2 API, marking them as
   * type LEGACY in the process. */
  if (v1Request) {
    // Should return immediately since promise was already fulfilled.
    let v1LibrariesData = (await v1Request).data;

    libraries = v1LibrariesData.results.map(library => {
      const { org, slug } = unpackLibraryKey(library.library_key);
      return {
        id: library.library_key,
        org,
        slug,
        bundle_uuid: null,
        title: library.display_name,
        description: null,
        version: null,
        has_unpublished_changes: false,
        has_unpublished_deletes: false,
        type: LIBRARY_TYPES.LEGACY,
      };
    });

    count = v1LibrariesData.count;
  }

  if (v2Request) {
    // Should return immediately since promise was already fulfilled.
    let v2LibrariesData = (await v2Request).data;
    libraries = v2LibrariesData.results;
    count = v2LibrariesData.count;
  }

  return {
    data: libraries,
    count,
  };
}
