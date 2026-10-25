"""Local work tracker."""


def create_app(data_dir=None, testing=False):
    from .web import create_app as factory

    return factory(data_dir=data_dir, testing=testing)
