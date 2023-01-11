library_authoring_mfe plugin for `Tutor <https://docs.tutor.overhang.io>`_
===================================================================================

Installation
------------

Follow these instructions to enable this microfrontend:

* Install `tutor nightly <https://github.com/overhangio/tutor/tree/nightly>`_: ``pip install -e 'git+https://github.com/overhangio/tutor.git@nightly#egg=tutor'``
* Install `tutor-mfe nightly <https://github.com/overhangio/tutor-mfe/tree/nightly>`_: ``pip install -e 'git+https://github.com/overhangio/tutor-mfe.git@nightly#egg=tutor-mfe'``
* To use blockstore with `minio <https://min.io/>`_
  
  * Install `tutor-minio <https://github.com/overhangio/tutor-minio>`_ nightly ``pip install -e 'git+https://github.com/overhangio/tutor-minio.git@nightly#egg=tutor-minio'``
  * Enable minio plugin: ``tutor plugins enable minio``
  * Install `tutor-contrib-blockstore-minio <https://github.com/brian-smith-tcril/tutor-contrib-blockstore-minio/>`_: ``pip install -e 'git+https://github.com/brian-smith-tcril/tutor-contrib-blockstore-minio#egg=tutor-contrib-blockstore-minio'``
  * Enable the blockstore_config_minio plugin: ``tutor plugins enable blockstore_config_minio``

* To use blockstore with django :code:`FileSystemStorage`

  * Install `tutor-contrib-blockstore-filesystem <https://github.com/brian-smith-tcril/tutor-contrib-blockstore-filesystem/>`_: ``pip install -e 'git+https://github.com/brian-smith-tcril/tutor-contrib-blockstore-filesystem#egg=tutor-contrib-blockstore-filesystem'``
  * Enable the blockstore_config_filesystem plugin: ``tutor plugins enable blockstore_config_filesystem``

* Install this plugin: ``pip install -e 'git+https://github.com/brian-smith-tcril/frontend-app-library-authoring.git@tutor-prod#egg=tutor-contrib-library-authoring-mfe&subdirectory=tutor-contrib-library-authoring-mfe'``
* Enable this plugin: ``tutor plugins enable library_authoring_mfe``
* Save the tutor config: ``tutor config save``
* Build mfe image: ``tutor images build mfe`` (if you have trouble here you may need to run it with ``--no-cache``) 
* Launch tutor: ``tutor local launch``

If you want to run this MFE in
`development mode <https://github.com/overhangio/tutor-mfe/#mfe-development>`_
(to make changes to the code), instead of step 9 above, do this::

   cd /path/to/frontend-app-library-authoring
   tutor dev run --mount=. library-authoring npm install  # Ensure NPM requirements are installed into your fork.
   tutor dev start --mount=. library-authoring

Setup
-----
* Ensure you have created a user: https://docs.tutor.overhang.io/local.html#creating-a-new-user-with-staff-and-admin-rights
* Ensure you have created an organization: http://studio.local.overhang.io/admin/organizations/organization/
* If you're using minio

  * Log in to the `minio Web UI <http://minio.local.overhang.io>`_ (`instructions to find credentials <https://github.com/overhangio/tutor-minio#web-ui>`_)
  * Create a **public** bucket for blockstore (the default configuration expects the bucket to be named :code:`blockstore`)

Usage
-----
* Log in to studio: http://studio.local.overhang.io/home/
* Click on the libraries tab
